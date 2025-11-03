import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payments.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Notification } from 'src/entities/notifications.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Subscription)
    private SubscriptionRepo: Repository<Subscription>,
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
  ) {}
  // Tạo bản ghi Payment mới
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const record = this.paymentRepo.create({
        ...createPaymentDto,
        amount: 10,
      }); // tạm thời set sẵn amount
      const savedPayment = await this.paymentRepo.save(record);

      // payment tạo mới -> subscription.status = active
      await this.SubscriptionRepo.update(createPaymentDto.subscription_id, {
        status: 'active',
      });

      // Tạo thông báo
      const subscription = await this.SubscriptionRepo.findOne({
        where: { id: createPaymentDto.subscription_id },
        select: ['id', 'user_id'],
      });

      const user_id = subscription.user_id;
      const createRepo = this.notiRepo.create({
        user_id: user_id,
        title: 'Thanh toán thành công',
        message: `Thanh toán cho đăng ký #${subscription.id} đã được thực hiện thành công.`,
      });
      await this.notiRepo.save(createRepo);

      const subscriptionByID = await this.SubscriptionRepo.findOne({
        where: { id: createPaymentDto.subscription_id },
      });
      console.log('subscriptionByID:', subscriptionByID);
      return savedPayment;
    } catch (error) {
      throw new Error(`Không thể tạo payment: ${error.message}`);
    }
  }

  // Tạm thời getAll để kiểm tra dữ liệu
  getAll() {
    return this.paymentRepo.find();
  }
}
