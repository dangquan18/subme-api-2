import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vendor } from 'src/entities/vendors.entity';
import { Plan } from 'src/entities/plans.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Payment } from 'src/entities/payments.entity';
import { Review } from 'src/entities/reviews.entity';
import { CreatePlanDto } from '../plan/dto/create-plan.dto';
import { UpdatePlanDto } from '../plan/dto/update-plan.dto';

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
  ) {}

  /**
   * GET /vendor/stats - Thống kê dashboard
   */
  async getStats(vendorId: number) {
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
  async getPackages(vendorId: number) {
    return this.planRepo.find({
      where: { vendor_id: vendorId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * POST /vendor/packages - Tạo gói mới
   */
  async createPackage(vendorId: number, dto: CreatePlanDto) {
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
  async updatePackage(id: number, vendorId: number, dto: UpdatePlanDto) {
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
  async deletePackage(id: number, vendorId: number) {
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
    vendorId: number,
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ) {
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
  async getAnalytics(vendorId: number, startDate: string, endDate: string) {
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
    vendorId: number,
    planId?: number,
    limit: number = 20,
    offset: number = 0,
  ) {
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.plan', 'plan')
      .where('plan.vendor_id = :vendorId', { vendorId });

    if (planId) {
      queryBuilder.andWhere('review.plan_id = :planId', { planId });
    }

    queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }
}
