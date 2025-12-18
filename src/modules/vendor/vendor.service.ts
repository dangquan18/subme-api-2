import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vendor } from 'src/entities/vendors.entity';
import { Plan } from 'src/entities/plans.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Payment } from 'src/entities/payments.entity';
import { Review } from 'src/entities/reviews.entity';
import { CreatePlanDto } from '../plan/dto/create-plan.dto';
import { UpdatePlanDto } from '../plan/dto/update-plan.dto';
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Helper: Get vendor ID from user ID
   */
  private async getVendorIdFromUserId(userId: number): Promise<number> {
    const vendor = await this.vendorRepo.findOne({
      where: { user_id: userId },
    });

    if (!vendor) {
      throw new NotFoundException(
        'Vendor profile not found. Please contact admin.',
      );
    }

    return vendor.id;
  }

  /**
   * GET /vendor/info - Lấy thông tin vendor theo userId
   */
  async getVendorInfo(userId: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { user_id: userId },
      relations: ['user', 'plans'],
    });

    if (!vendor) {
      throw new NotFoundException(
        'Vendor profile not found. Please contact admin.',
      );
    }

    // Tính toán số lượng subscribers cho vendor
    const totalSubscribers = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId: vendor.id })
      .andWhere('subscription.status = :status', { status: 'active' })
      .getCount();

    // Tính toán tổng revenue
    const revenueResult = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .leftJoin('payment.subscription', 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId: vendor.id })
      .andWhere('payment.status = :status', { status: 'success' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total) || 0;

    // Tính toán rating trung bình
    const ratingResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .leftJoin('review.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId: vendor.id })
      .getRawOne();

    const averageRating = parseFloat(ratingResult.avg) || 0;

    // Loại bỏ password khỏi response
    const { password, ...vendorData } = vendor;

    return {
      ...vendorData,
      totalSubscribers,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalPlans: vendor.plans?.length || 0,
    };
  }

  /**
   * GET /vendor/stats - Thống kê dashboard
   */
  async getStats(userId: number) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    // Total revenue
    const revenueResult = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .leftJoin('payment.subscription', 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId })
      .andWhere('payment.status = :status', { status: 'success' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total) || 0;

    // Total packages
    const totalPackages = await this.planRepo.count({
      where: { vendor_id: vendorId },
    });

    // Active subscribers
    const activeSubscribers = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId })
      .andWhere('subscription.status = :status', { status: 'active' })
      .getCount();

    // Pending packages
    const pendingPackages = await this.planRepo.count({
      where: { vendor_id: vendorId, status: 'pending' },
    });

    // Top packages
    const topPackages = await this.planRepo.find({
      where: { vendor_id: vendorId },
      order: { subscriber_count: 'DESC' },
      take: 5,
    });

    return {
      totalRevenue,
      totalPackages,
      activeSubscribers,
      pendingPackages,
      topPackages,
    };
  }

  /**
   * GET /vendor/packages - Danh sách gói của vendor
   */
  async getPackages(userId: number) {
    const vendorId = await this.getVendorIdFromUserId(userId);
    return this.planRepo.find({
      where: { vendor_id: vendorId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * GET /vendor/packages/:id - Chi tiết một gói
   */
  async getPackageDetail(userId: number, planId: number) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const plan = await this.planRepo.findOne({
      where: { id: planId, vendor_id: vendorId },
      relations: ['category'],
    });

    if (!plan) {
      throw new NotFoundException('Package not found');
    }

    // Get subscription statistics
    const subscriptionStats = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .select('subscription.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('subscription.plan_id = :planId', { planId })
      .groupBy('subscription.status')
      .getRawMany();

    // Get total revenue from this plan
    const revenueResult = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .leftJoin('payment.subscription', 'subscription')
      .where('subscription.plan_id = :planId', { planId })
      .andWhere('payment.status = :status', { status: 'success' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total) || 0;

    // Get average rating
    const ratingResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.plan_id = :planId', { planId })
      .getRawOne();

    const averageRating = parseFloat(ratingResult.average) || 0;
    const reviewCount = parseInt(ratingResult.count) || 0;

    return {
      ...plan,
      statistics: {
        subscriptions: subscriptionStats,
        totalRevenue,
        averageRating,
        reviewCount,
      },
    };
  }

  /**
   * POST /vendor/packages - Tạo gói mới
   */
  async createPackage(userId: number, dto: CreatePlanDto) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const plan = this.planRepo.create({
      ...dto,
      vendor_id: vendorId,
      status: 'pending', // Chờ admin duyệt
    });

    await this.planRepo.save(plan);

    return {
      success: true,
      message: 'Gói đã được tạo, đang chờ admin duyệt',
      plan,
    };
  }

  /**
   * PATCH /vendor/packages/:id - Cập nhật gói
   */
  async updatePackage(id: number, userId: number, dto: UpdatePlanDto) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const plan = await this.planRepo.findOne({
      where: { id, vendor_id: vendorId },
    });

    if (!plan) {
      throw new NotFoundException('Package not found');
    }

    Object.assign(plan, dto);
    await this.planRepo.save(plan);

    return {
      success: true,
      message: 'Package updated',
      plan,
    };
  }

  /**
   * DELETE /vendor/packages/:id - Xóa gói
   */
  async deletePackage(id: number, userId: number) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const plan = await this.planRepo.findOne({
      where: { id, vendor_id: vendorId },
    });

    if (!plan) {
      throw new NotFoundException('Package not found');
    }

    // Check if has subscribers
    const subscriberCount = await this.subscriptionRepo.count({
      where: { plan_id: id },
    });

    if (subscriberCount > 0) {
      throw new BadRequestException('Cannot delete package with subscribers');
    }

    await this.planRepo.remove(plan);

    return {
      success: true,
      message: 'Package deleted',
    };
  }

  /**
   * GET /vendor/orders - Danh sách đơn hàng/subscriptions
   */
  async getOrders(
    userId: number,
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const queryBuilder = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.payments', 'payments')
      .where('plan.vendor_id = :vendorId', { vendorId });

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    queryBuilder
      .orderBy('subscription.start_date', 'DESC')
      .skip(offset)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders,
      total,
      limit,
      offset,
    };
  }

  /**
   * GET /vendor/analytics - Thống kê chi tiết theo thời gian
   */
  async getAnalytics(userId: number, startDate: string, endDate: string) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Daily stats
    const dailyStats = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('DATE(payment.createdAt)', 'date')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(payment.id)', 'orders')
      .leftJoin('payment.subscription', 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId })
      .andWhere('payment.status = :status', { status: 'success' })
      .andWhere('payment.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('DATE(payment.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      daily_stats: dailyStats,
      start_date: startDate,
      end_date: endDate,
    };
  }

  /**
   * GET /vendor/reviews - Đánh giá các gói
   */
  async getReviews(
    userId: number,
    planId?: number,
    limit: number = 20,
    offset: number = 0,
  ) {
    const vendorId = await this.getVendorIdFromUserId(userId);

    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId });

    if (planId) {
      queryBuilder.andWhere('review.plan_id = :planId', { planId });
    }

    queryBuilder.orderBy('review.createdAt', 'DESC').skip(offset).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }

  /**
   * ADMIN - GET all vendors (pending/approved/rejected)
   */
  async getAllVendors(status?: string, limit: number = 20, offset: number = 0) {
    const queryBuilder = this.vendorRepo
      .createQueryBuilder('vendor')
      .leftJoinAndSelect('vendor.user', 'user')
      .leftJoinAndSelect('vendor.plans', 'plans');

    if (status) {
      queryBuilder.where('vendor.status = :status', { status });
    }

    queryBuilder.orderBy('vendor.createdAt', 'DESC').skip(offset).take(limit);

    const [vendors, total] = await queryBuilder.getManyAndCount();

    // Remove passwords
    const vendorsWithoutPassword = vendors.map((vendor) => {
      const { password, ...vendorData } = vendor;
      return vendorData;
    });

    return {
      vendors: vendorsWithoutPassword,
      total,
      limit,
      offset,
    };
  }

  /**
   * ADMIN - Approve/Reject vendor
   */
  async approveVendor(vendorId: number, dto: ApproveVendorDto) {
    const vendor = await this.vendorRepo.findOne({
      where: { id: vendorId },
      relations: ['user'], // 👈 nếu vendor có liên kết user
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    // Cập nhật trạng thái
    vendor.status = dto.status;
    await this.vendorRepo.save(vendor);

    // ===================== GỬI MAIL (CÁCH 1) =====================
    // Ưu tiên email user → fallback sang email vendor
    const email = vendor.user?.email || vendor.email || null;

    if (email) {
      let subject = '';
      let content = '';

      if (dto.status === 'approved') {
        subject = 'Tài khoản Vendor đã được duyệt ✅';
        content = `
        <p>Xin chào <b>${vendor.name}</b>,</p>
        <p>Tài khoản vendor của bạn đã được <b>phê duyệt</b>.</p>
        <p>Bạn có thể bắt đầu đăng bán sản phẩm ngay 🎉</p>
      `;
      }

      if (dto.status === 'rejected') {
        subject = 'Tài khoản Vendor bị từ chối ❌';
        content = `
        <p>Xin chào <b>${vendor.name}</b>,</p>
        <p>Tài khoản vendor của bạn đã bị <b>từ chối</b>.</p>
        <p><b>Lý do:</b> ${dto.reason || 'Không có lý do cụ thể'}</p>
        <p>Vui lòng cập nhật lại thông tin và gửi lại để được xét duyệt.</p>
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
      console.warn(
        `[MAIL] Skip sending vendor approve mail - Vendor ${vendor.id} has no email`,
      );
    }
    // =============================================================

    return {
      message: `Vendor ${
        dto.status === 'approved'
          ? 'approved'
          : dto.status === 'rejected'
            ? 'rejected'
            : 'updated'
      } successfully`,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: email, // trả email đã dùng (nếu có)
        status: vendor.status,
        reason: dto.reason,
      },
    };
  }

  /**
   * ADMIN - Get vendor detail by ID
   */
  async getVendorById(vendorId: number) {
    const vendor = await this.vendorRepo.findOne({
      where: { id: vendorId },
      relations: ['user', 'plans'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const { password, ...vendorData } = vendor;

    // Calculate stats
    const totalSubscribers = await this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId })
      .andWhere('subscription.status = :status', { status: 'active' })
      .getCount();

    const revenueResult = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .leftJoin('payment.subscription', 'subscription')
      .leftJoin('subscription.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId })
      .andWhere('payment.status = :status', { status: 'success' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total) || 0;

    return {
      ...vendorData,
      totalSubscribers,
      totalRevenue,
      totalPlans: vendor.plans?.length || 0,
    };
  }
}
