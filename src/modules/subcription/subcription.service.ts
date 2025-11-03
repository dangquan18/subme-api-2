import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Plan } from 'src/entities/plans.entity';
import { Payment } from 'src/entities/payments.entity';
import { Notification } from 'src/entities/notifications.entity';
import { User } from 'src/entities/users.entity';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';

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
   * Mua gói: Tạo subscription + payment cùng lúc
   */
  async purchasePlan(userId: number, planId: number, paymentMethod: string) {
    try {
      // 1. Validate user tồn tại
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: `Không tìm thấy user với id: ${userId}`,
            error: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. Lấy thông tin plan
      const plan = await this.planRepo.findOne({
        where: { id: planId },
        relations: ['vendor', 'category'],
      });

      if (!plan) {
        throw new HttpException(
          {
            success: false,
            message: `Không tìm thấy gói với id: ${planId}`,
            error: 'PLAN_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (plan.status !== 'approved') {
        throw new HttpException(
          {
            success: false,
            message: `Gói "${plan.name}" chưa được phê duyệt`,
            error: 'PLAN_NOT_APPROVED',
            data: {
              plan_id: planId,
              plan_name: plan.name,
              plan_status: plan.status,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Kiểm tra user đã mua gói này chưa (đang active hoặc chưa hết hạn)
      const existingSubscription = await this.subscriptionRepo.findOne({
        where: {
          user_id: userId,
          plan_id: planId,
          status: 'active',
        },
      });

      if (existingSubscription) {
        // Kiểm tra còn hạn không
        const now = new Date();
        if (new Date(existingSubscription.end_date) > now) {
          throw new HttpException(
            {
              success: false,
              message: `Bạn đã đăng ký gói "${plan.name}" rồi`,
              error: 'ALREADY_SUBSCRIBED',
              data: {
                subscription_id: existingSubscription.id,
                plan_name: plan.name,
                start_date: existingSubscription.start_date,
                end_date: existingSubscription.end_date,
                expires_in_days: Math.ceil(
                  (new Date(existingSubscription.end_date).getTime() -
                    now.getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              },
            },
            HttpStatus.CONFLICT,
          );
        }
      }

      // 4. Tính end_date dựa trên duration
      const startDate = new Date();
      const endDate = new Date(startDate);

      switch (plan.duration_unit) {
        case 'ngày':
          endDate.setDate(endDate.getDate() + plan.duration_value);
          break;
        case 'tuần':
          endDate.setDate(endDate.getDate() + plan.duration_value * 7);
          break;
        case 'tháng':
          endDate.setMonth(endDate.getMonth() + plan.duration_value);
          break;
        case 'năm':
          endDate.setFullYear(endDate.getFullYear() + plan.duration_value);
          break;
        default:
          throw new HttpException(
            {
              success: false,
              message: `Duration unit không hợp lệ: ${plan.duration_unit}`,
              error: 'INVALID_DURATION_UNIT',
            },
            HttpStatus.BAD_REQUEST,
          );
      }

      // 5. Tạo subscription với status active
      const subscription = this.subscriptionRepo.create({
        user_id: userId,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
      });
      const savedSubscription = await this.subscriptionRepo.save(subscription);

      // 6. Validate và tạo payment
      const validMethod =
        paymentMethod === 'VNPay' || paymentMethod === 'MoMo'
          ? (paymentMethod as 'VNPay' | 'MoMo')
          : ('VNPay' as 'VNPay' | 'MoMo');

      const payment = this.paymentRepo.create({
        subscription_id: savedSubscription.id,
        amount: plan.price,
        method: validMethod,
        status: 'success' as 'success' | 'pending' | 'failed',
        transaction_id: `TXN${Date.now()}`,
      });
      const savedPayment = await this.paymentRepo.save(payment);

      // 7. Tạo thông báo
      const notification = this.notiRepo.create({
        user_id: userId,
        title: 'Đăng ký thành công',
        message: `Bạn đã đăng ký gói "${plan.name}" của ${plan.vendor.name} thành công. Số tiền: ${plan.price.toLocaleString('vi-VN')} VNĐ. Có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}.`,
      });
      await this.notiRepo.save(notification);

      return {
        success: true,
        message: 'Đăng ký và thanh toán thành công',
        data: {
          subscription: {
            id: savedSubscription.id,
            status: savedSubscription.status,
            start_date: savedSubscription.start_date,
            end_date: savedSubscription.end_date,
          },
          payment: {
            id: savedPayment.id,
            amount: savedPayment.amount,
            method: savedPayment.method,
            transaction_id: savedPayment.transaction_id,
            status: savedPayment.status,
          },
          plan: {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            vendor: plan.vendor.name,
          },
        },
      };
    } catch (error) {
      // Nếu là HttpException thì throw luôn
      if (error instanceof HttpException) {
        throw error;
      }

      // Lỗi không mong muốn khác
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi mua gói',
          error: 'INTERNAL_SERVER_ERROR',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tạo subscription riêng (không tạo payment)
   */
  async createNew(createDto: CreateSubcriptionDto): Promise<any> {
    try {
      // Lấy thông tin plan để tính end_date
      const plan = await this.planRepo.findOne({
        where: { id: createDto.plan_id },
        relations: ['vendor'],
      });

      if (!plan) {
        throw new HttpException(
          {
            success: false,
            message: `Không tìm thấy gói với id: ${createDto.plan_id}`,
            error: 'PLAN_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Kiểm tra user đã mua gói này chưa
      const existingSubscription = await this.subscriptionRepo.findOne({
        where: {
          user_id: createDto.user_id,
          plan_id: createDto.plan_id,
          status: 'active',
        },
      });

      if (existingSubscription) {
        const now = new Date();
        if (new Date(existingSubscription.end_date) > now) {
          throw new HttpException(
            {
              success: false,
              message: `Bạn đã đăng ký gói "${plan.name}" rồi`,
              error: 'ALREADY_SUBSCRIBED',
              data: {
                subscription_id: existingSubscription.id,
                plan_name: plan.name,
                end_date: existingSubscription.end_date,
              },
            },
            HttpStatus.CONFLICT,
          );
        }
      }

      // Tính end_date
      const startDate = new Date();
      const endDate = new Date(startDate);

      switch (plan.duration_unit) {
        case 'ngày':
          endDate.setDate(endDate.getDate() + plan.duration_value);
          break;
        case 'tuần':
          endDate.setDate(endDate.getDate() + plan.duration_value * 7);
          break;
        case 'tháng':
          endDate.setMonth(endDate.getMonth() + plan.duration_value);
          break;
        case 'năm':
          endDate.setFullYear(endDate.getFullYear() + plan.duration_value);
          break;
        default:
          throw new HttpException(
            {
              success: false,
              message: `Duration unit không hợp lệ: ${plan.duration_unit}`,
              error: 'INVALID_DURATION_UNIT',
            },
            HttpStatus.BAD_REQUEST,
          );
      }

      // Tạo subscription với status = pending_payment
      const subscription = this.subscriptionRepo.create({
        user_id: createDto.user_id,
        plan_id: createDto.plan_id,
        start_date: startDate,
        end_date: endDate,
        status: 'pending_payment',
      });

      const savedSubscription = await this.subscriptionRepo.save(subscription);

      // Trả về thông tin để frontend chuyển sang bước thanh toán
      return {
        success: true,
        message: 'Tạo đăng ký thành công, vui lòng thanh toán',
        data: {
          subscription: savedSubscription,
          payment_info: {
            subscription_id: savedSubscription.id,
            amount: plan.price,
            plan_name: plan.name,
            vendor_name: plan.vendor.name,
          },
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi tạo đăng ký',
          error: 'INTERNAL_SERVER_ERROR',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy tất cả subscription
   */
  async findAll(): Promise<any> {
    try {
      const subscriptions = await this.subscriptionRepo.find({
        relations: ['plan', 'plan.vendor', 'plan.category'],
        order: { id: 'DESC' },
      });

      return {
        success: true,
        message: 'Lấy danh sách đăng ký thành công',
        data: subscriptions,
        total: subscriptions.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách đăng ký',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách gói đã mua của user
   */
  async getSubscriptionsByUser(userId: number): Promise<any> {
    try {
      const subscriptions = await this.subscriptionRepo.find({
        where: { user_id: userId },
        relations: ['plan', 'plan.vendor', 'plan.category'],
        order: { id: 'DESC' },
      });

      return {
        success: true,
        message: 'Lấy danh sách gói đã mua thành công',
        data: subscriptions,
        total: subscriptions.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách gói',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy danh sách gói đang active của user
   */
  async getActiveSubscriptionsByUser(userId: number): Promise<any> {
    try {
      const subscriptions = await this.subscriptionRepo.find({
        where: {
          user_id: userId,
          status: 'active',
        },
        relations: ['plan', 'plan.vendor', 'plan.category'],
        order: { id: 'DESC' },
      });

      return {
        success: true,
        message: 'Lấy danh sách gói đang hoạt động thành công',
        data: subscriptions,
        total: subscriptions.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách gói',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy chi tiết 1 subscription
   */
  async getSubscriptionDetail(subscriptionId: number): Promise<any> {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: { id: subscriptionId },
        relations: ['plan', 'plan.vendor', 'plan.category', 'payments'],
      });

      if (!subscription) {
        throw new HttpException(
          {
            success: false,
            message: `Không tìm thấy đăng ký với id: ${subscriptionId}`,
            error: 'SUBSCRIPTION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Lấy chi tiết đăng ký thành công',
        data: subscription,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy chi tiết đăng ký',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
