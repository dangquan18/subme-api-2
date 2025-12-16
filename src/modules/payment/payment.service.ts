import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payments.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Notification } from 'src/entities/notifications.entity';
import { Plan } from 'src/entities/plans.entity';
import { VnpayService } from './vnpay.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    private vnpayService: VnpayService,
  ) {}

  /**
   * GET /payments/history - Lịch sử thanh toán
   */
  async getHistory(
    userId: number,
    limit: number = 20,
    offset: number = 0,
    status?: 'success' | 'pending' | 'failed',
  ) {
    const queryBuilder = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscription', 'subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('plan.vendor', 'vendor')
      .where('subscription.user_id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    const [payments, total] = await queryBuilder.getManyAndCount();

    return {
      payments,
      total,
      limit,
      offset,
    };
  }

  /**
   * GET /payments/:id - Chi tiết thanh toán
   */
  async getById(id: number, userId: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['subscription', 'subscription.plan', 'subscription.plan.vendor'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify user owns this payment
    if (payment.subscription.user_id !== userId) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * POST /payments/process - Xử lý thanh toán
   */
  async processPayment(dto: ProcessPaymentDto, userId: number, ipAddr: string) {
    const { subscription_id, payment_method, amount } = dto;

    // Check subscription exists and belongs to user
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscription_id, user_id: userId },
      relations: ['plan', 'plan.vendor'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Create payment record with pending status
    const payment = this.paymentRepo.create({
      subscription_id,
      amount,
      method: payment_method,
      status: 'pending',
      transaction_id: `TXN${Date.now()}`,
    });

    await this.paymentRepo.save(payment);

    // Generate payment URL based on method
    let payment_url = '';

    if (payment_method === 'VNPay') {
      const orderInfo = `Thanh toan goi ${subscription.plan.name}`;
      payment_url = this.vnpayService.createPaymentUrl(
        payment.transaction_id,
        amount,
        orderInfo,
        ipAddr,
      );
    } else if (payment_method === 'MoMo') {
      // TODO: Implement MoMo payment
      payment_url = 'https://momo.vn/payment'; // Placeholder
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        transaction_id: payment.transaction_id,
        amount: payment.amount,
        status: payment.status,
      },
      payment_url,
    };
  }

  /**
   * POST /payments/vnpay/callback - VNPay callback
   */
  async vnpayCallback(vnpParams: any) {
    const verification = this.vnpayService.verifyReturnUrl(vnpParams);
    
    const transaction_id = vnpParams['vnp_TxnRef'];
    const vnp_ResponseCode = vnpParams['vnp_ResponseCode'];

    // Find payment by transaction_id
    const payment = await this.paymentRepo.findOne({
      where: { transaction_id },
      relations: ['subscription', 'subscription.plan', 'subscription.plan.vendor'],
    });

    if (!payment) {
      return {
        success: false,
        message: 'Payment not found',
      };
    }

    if (!verification.isValid) {
      payment.status = 'failed';
      await this.paymentRepo.save(payment);

      return {
        success: false,
        message: verification.message,
        payment_status: 'failed',
      };
    }

    if (vnp_ResponseCode === '00') {
      // Payment success
      payment.status = 'success';
      await this.paymentRepo.save(payment);

      // Update subscription status
      const subscription = payment.subscription;
      subscription.status = 'active';

      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = this.calculateEndDate(
        startDate,
        subscription.plan.duration_value,
        subscription.plan.duration_unit,
      );

      subscription.start_date = startDate;
      subscription.end_date = endDate;
      await this.subscriptionRepo.save(subscription);

      // Create notification
      await this.createNotification(
        subscription.user_id,
        'Thanh toán thành công',
        `Bạn đã thanh toán thành công cho gói "${subscription.plan.name}". Gói của bạn có hiệu lực từ ${this.formatDate(startDate)} đến ${this.formatDate(endDate)}.`,
      );

      return {
        success: true,
        message: 'Thanh toán thành công',
        payment_status: 'success',
      };
    } else {
      // Payment failed
      payment.status = 'failed';
      await this.paymentRepo.save(payment);

      return {
        success: false,
        message: 'Thanh toán thất bại',
        payment_status: 'failed',
      };
    }
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
  private async createNotification(userId: number, title: string, message: string) {
    const notification = this.notiRepo.create({
      user_id: userId,
      type: 'payment',
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
