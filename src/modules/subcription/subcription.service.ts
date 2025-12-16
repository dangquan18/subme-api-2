import { Injectable, HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Plan } from 'src/entities/plans.entity';
import { Payment } from 'src/entities/payments.entity';
import { Notification } from 'src/entities/notifications.entity';
import { User } from 'src/entities/users.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * GET /subscriptions - Danh sách đăng ký của user
   */
  async findAll(userId: number, status?: string) {
    const queryBuilder = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .leftJoinAndSelect('plan.category', 'category')
      .where('subscription.user_id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    queryBuilder.orderBy('subscription.start_date', 'DESC');

    const subscriptions = await queryBuilder.getMany();

    return subscriptions;
  }

  /**
   * GET /subscriptions/:id - Chi tiết đăng ký
   */
  async findOne(id: number, userId: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['plan', 'plan.vendor', 'plan.category', 'payments'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  /**
   * POST /subscriptions - Tạo đăng ký mới
   */
  async create(userId: number, dto: CreateSubscriptionDto) {
    const { plan_id, payment_method, auto_renew } = dto;

    // Validate plan
    const plan = await this.planRepo.findOne({
      where: { id: plan_id },
      relations: ['vendor'],
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.status !== 'approved' || !plan.is_active) {
      throw new BadRequestException('Plan is not available');
    }

    // Check if user already has active subscription for this plan
    const existingSubscription = await this.subscriptionRepo.findOne({
      where: {
        user_id: userId,
        plan_id,
        status: 'active',
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('You already have an active subscription for this plan');
    }

    // Create subscription with pending_payment status
    const subscription = this.subscriptionRepo.create({
      user_id: userId,
      plan_id,
      status: 'pending_payment',
      auto_renew: auto_renew ?? true,
    });

    await this.subscriptionRepo.save(subscription);

    // Create notification
    await this.createNotification(
      userId,
      'subscription',
      'Đăng ký mới',
      `Bạn đã tạo đăng ký cho gói "${plan.name}". Vui lòng thanh toán để kích hoạt.`,
    );

    return {
      success: true,
      message: 'Subscription created. Please proceed with payment.',
      subscription: {
        id: subscription.id,
        plan_id: subscription.plan_id,
        status: subscription.status,
        amount: plan.price,
        payment_method,
      },
    };
  }

  /**
   * PATCH /subscriptions/:id - Cập nhật auto_renew
   */
  async update(id: number, userId: number, dto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (dto.auto_renew !== undefined) {
      subscription.auto_renew = dto.auto_renew;
    }

    await this.subscriptionRepo.save(subscription);

    return {
      success: true,
      message: 'Subscription updated',
      subscription,
    };
  }

  /**
   * POST /subscriptions/:id/pause - Tạm dừng đăng ký
   */
  async pause(id: number, userId: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    subscription.status = 'cancelled'; // Sử dụng cancelled cho paused
    subscription.paused_at = new Date();
    await this.subscriptionRepo.save(subscription);

    await this.createNotification(
      userId,
      'subscription',
      'Đăng ký đã tạm dừng',
      `Gói "${subscription.plan.name}" của bạn đã được tạm dừng.`,
    );

    return {
      success: true,
      message: 'Subscription paused',
      subscription,
    };
  }

  /**
   * POST /subscriptions/:id/resume - Tiếp tục đăng ký
   */
  async resume(id: number, userId: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.paused_at) {
      throw new BadRequestException('Subscription is not paused');
    }

    subscription.status = 'active';
    subscription.paused_at = null;
    await this.subscriptionRepo.save(subscription);

    await this.createNotification(
      userId,
      'subscription',
      'Đăng ký đã được tiếp tục',
      `Gói "${subscription.plan.name}" của bạn đã được kích hoạt lại.`,
    );

    return {
      success: true,
      message: 'Subscription resumed',
      subscription,
    };
  }

  /**
   * POST /subscriptions/:id/renew - Gia hạn đăng ký
   */
  async renew(id: number, userId: number, paymentMethodId?: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Calculate new end date
    const currentEndDate = new Date(subscription.end_date);
    const newEndDate = this.calculateEndDate(
      currentEndDate,
      subscription.plan.duration_value,
      subscription.plan.duration_unit,
    );

    subscription.end_date = newEndDate;
    subscription.status = 'active';
    await this.subscriptionRepo.save(subscription);

    // Create payment record (pending)
    const payment = this.paymentRepo.create({
      subscription_id: subscription.id,
      amount: subscription.plan.price,
      method: 'VNPay',
      status: 'pending',
      transaction_id: `TXN${Date.now()}`,
    });

    await this.paymentRepo.save(payment);

    await this.createNotification(
      userId,
      'subscription',
      'Gia hạn thành công',
      `Gói "${subscription.plan.name}" đã được gia hạn đến ${this.formatDate(newEndDate)}.`,
    );

    return {
      success: true,
      message: 'Subscription renewed',
      subscription,
      payment,
    };
  }

  /**
   * DELETE /subscriptions/:id - Hủy đăng ký
   */
  async cancel(id: number, userId: number) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id, user_id: userId },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    subscription.status = 'cancelled';
    subscription.cancelled_at = new Date();
    subscription.auto_renew = false;
    await this.subscriptionRepo.save(subscription);

    await this.createNotification(
      userId,
      'subscription',
      'Đăng ký đã hủy',
      `Gói "${subscription.plan.name}" của bạn đã được hủy.`,
    );

    return {
      success: true,
      message: 'Subscription cancelled',
      subscription,
    };
  }

  /**
   * Helper: Calculate end date
   */
  private calculateEndDate(startDate: Date, value: number, unit: string): Date {
    const endDate = new Date(startDate);

    switch (unit) {
      case 'ngày':
        endDate.setDate(endDate.getDate() + value);
        break;
      case 'tuần':
        endDate.setDate(endDate.getDate() + value * 7);
        break;
      case 'tháng':
        endDate.setMonth(endDate.getMonth() + value);
        break;
      case 'năm':
        endDate.setFullYear(endDate.getFullYear() + value);
        break;
    }

    return endDate;
  }

  /**
   * Helper: Create notification
   */
  private async createNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
  ) {
    const notification = this.notiRepo.create({
      user_id: userId,
      type: type as any,
      title,
      message,
      is_read: false,
    });

    await this.notiRepo.save(notification);
  }

  /**
   * Helper: Format date
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
