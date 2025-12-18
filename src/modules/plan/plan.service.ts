import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plans.entity';
import { Repository, Like } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GetPackagesDto } from './dto/get-packages.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApprovePlanDto } from './dto/approve-plan.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    private readonly mailService: MailService, // 👈 thêm dòng này
  ) {}

  // GET /packages - Lấy danh sách gói dịch vụ với filters
  async findAll(query: GetPackagesDto) {
    const {
      category,
      vendor,
      min_price,
      max_price,
      duration_unit,
      limit,
      offset,
      sort,
    } = query;

    const queryBuilder = this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .leftJoinAndSelect('plan.category', 'category')
      .where('plan.status = :status', { status: 'approved' })
      .andWhere('plan.is_active = :active', { active: true });

    // Apply filters
    if (category) {
      queryBuilder.andWhere('plan.category_id = :category', { category });
    }

    if (vendor) {
      queryBuilder.andWhere('plan.vendor_id = :vendor', { vendor });
    }

    if (min_price !== undefined) {
      queryBuilder.andWhere('plan.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      queryBuilder.andWhere('plan.price <= :max_price', { max_price });
    }

    if (duration_unit) {
      queryBuilder.andWhere('plan.duration_unit = :duration_unit', {
        duration_unit,
      });
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        queryBuilder.orderBy('plan.price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('plan.price', 'DESC');
        break;
      case 'popular':
        queryBuilder.orderBy('plan.subscriber_count', 'DESC');
        break;
      case 'newest':
      default:
        queryBuilder.orderBy('plan.createdAt', 'DESC');
        break;
    }

    // Pagination
    queryBuilder.skip(offset).take(limit);

    const [packages, total] = await queryBuilder.getManyAndCount();

    return {
      packages,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  // GET /packages/featured - Lấy gói nổi bật
  async findFeatured(limit: number = 10) {
    const packages = await this.planRepository.find({
      where: {
        status: 'approved',
        is_active: true,
      },
      relations: ['vendor', 'category'],
      order: {
        subscriber_count: 'DESC',
        average_rating: 'DESC',
      },
      take: limit,
    });

    return packages;
  }

  // GET /packages/:id - Chi tiết gói
  async findOne(id: number) {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['vendor', 'category'],
    });

    if (!plan) {
      throw new NotFoundException('Package not found');
    }

    // TODO: Check if user has favorited this package
    const is_favorited = false; // Will implement with favorites module

    return {
      ...plan,
      is_favorited,
    };
  }

  // GET /packages/search - Tìm kiếm
  async search(searchQuery: string, limit: number = 20) {
    const packages = await this.planRepository.find({
      where: [
        { name: Like(`%${searchQuery}%`), status: 'approved', is_active: true },
        {
          description: Like(`%${searchQuery}%`),
          status: 'approved',
          is_active: true,
        },
      ],
      relations: ['vendor', 'category'],
      take: limit,
    });

    return packages;
  }

  // GET /packages/category/:categoryId
  async findByCategory(categoryId: number) {
    const packages = await this.planRepository.find({
      where: {
        category_id: categoryId,
        status: 'approved',
        is_active: true,
      },
      relations: ['vendor', 'category'],
      order: {
        createdAt: 'DESC',
      },
    });

    return packages;
  }

  // For vendor: create plan
  async create(createDto: CreatePlanDto, vendorId: number) {
    const plan = this.planRepository.create({
      ...createDto,
      vendor_id: vendorId,
      status: 'pending', // Chờ admin duyệt
    });

    await this.planRepository.save(plan);

    return {
      success: true,
      message: 'Gói đã được tạo, đang chờ admin duyệt',
      plan,
    };
  }

  // For vendor: update plan
  async update(id: number, updateDto: UpdatePlanDto, vendorId: number) {
    const plan = await this.planRepository.findOne({
      where: { id, vendor_id: vendorId },
    });

    if (!plan) {
      throw new NotFoundException(
        'Package not found or you do not have permission',
      );
    }

    Object.assign(plan, updateDto);
    await this.planRepository.save(plan);

    return plan;
  }

  // For vendor: delete plan
  async remove(id: number, vendorId: number) {
    const plan = await this.planRepository.findOne({
      where: { id, vendor_id: vendorId },
      relations: ['subscriptions'],
    });

    if (!plan) {
      throw new NotFoundException(
        'Package not found or you do not have permission',
      );
    }

    // Check if anyone has subscribed
    if (plan.subscriptions && plan.subscriptions.length > 0) {
      return {
        success: false,
        message: 'Không thể xóa gói đã có người đăng ký',
      };
    }

    await this.planRepository.remove(plan);

    return {
      success: true,
      message: 'Đã xóa gói thành công',
    };
  }

  // For vendor: get their plans
  async findByVendor(vendorId: number) {
    return this.planRepository.find({
      where: { vendor_id: vendorId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ADMIN - Get all plans (including pending)
   */
  async getAllPlansForAdmin(
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const queryBuilder = this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .leftJoinAndSelect('plan.category', 'category');

    if (status) {
      queryBuilder.where('plan.status = :status', { status });
    }

    queryBuilder.orderBy('plan.createdAt', 'DESC').skip(offset).take(limit);

    const [plans, total] = await queryBuilder.getManyAndCount();

    return {
      plans,
      total,
      limit,
      offset,
    };
  }

  /**
   * ADMIN - Approve/Reject plan
   */
  async approvePlan(planId: number, dto: ApprovePlanDto) {
    const plan = await this.planRepository.findOne({
      where: { id: planId },
      relations: ['vendor', 'vendor.user', 'category'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    // Cập nhật trạng thái
    plan.status = dto.status;

    if (dto.status === 'rejected') {
      plan.is_active = false;
    }

    await this.planRepository.save(plan);

    // ===================== GỬI MAIL (CÁCH 1) =====================
    // Ưu tiên email user -> fallback sang email vendor
    const email = plan.vendor?.user?.email || plan.vendor?.email || null;

    if (email) {
      let subject = '';
      let content = '';

      if (dto.status === 'approved') {
        subject = 'Gói dịch vụ đã được duyệt ✅';
        content = `
        <p>Xin chào <b>${plan.vendor.name}</b>,</p>
        <p>Gói <b>${plan.name}</b> (Danh mục: ${plan.category.name}) đã được <b>phê duyệt</b>.</p>
        <p>Bạn có thể bắt đầu kinh doanh ngay 🎉</p>
      `;
      }

      if (dto.status === 'rejected') {
        subject = 'Gói dịch vụ bị từ chối ❌';
        content = `
        <p>Xin chào <b>${plan.vendor.name}</b>,</p>
        <p>Gói <b>${plan.name}</b> đã bị <b>từ chối</b>.</p>
        <p><b>Lý do:</b> ${dto.reason || 'Không có lý do cụ thể'}</p>
        <p>Vui lòng chỉnh sửa và gửi lại để được xét duyệt.</p>
      `;
      }

      if (subject && content) {
        await this.mailService.sendRegisterSuccess(
          email,
          `
          <h3>${subject}</h3>
          ${content}
        `,
        );
      }
    } else {
      // Không có email → không cho crash API
      console.warn(
        `[MAIL] Skip sending mail - Vendor ${plan.vendor?.id} has no email`,
      );
    }
    // =============================================================

    return {
      message: `Plan ${
        dto.status === 'approved'
          ? 'approved'
          : dto.status === 'rejected'
            ? 'rejected'
            : 'updated'
      } successfully`,
      plan: {
        id: plan.id,
        name: plan.name,
        vendor: plan.vendor.name,
        status: plan.status,
        reason: dto.reason,
      },
    };
  }

  /**
   * ADMIN - Get plan detail by ID (including pending)
   */
  async getPlanByIdForAdmin(planId: number) {
    const plan = await this.planRepository.findOne({
      where: { id: planId },
      relations: ['vendor', 'category', 'subscriptions'],
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found`);
    }

    return plan;
  }
}
