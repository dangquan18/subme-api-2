import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payments.entity';
import { Subscription } from 'src/entities/subscriptions.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Subscription)
    private SubscriptionRepo: Repository<Subscription>,
  ) {}
  // Tạo bản ghi Payment mới
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const record = this.paymentRepo.create(createPaymentDto);
      const savedPayment = await this.paymentRepo.save(record);

      // payment tạo mới -> subscription.status = active
      await this.SubscriptionRepo.update(createPaymentDto.subscription_id, {
        status: 'active',
      });
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
