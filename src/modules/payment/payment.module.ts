import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { VnpayService } from './vnpay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payments.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Notification } from 'src/entities/notifications.entity';
import { Plan } from 'src/entities/plans.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Subscription, Notification, Plan])],
  controllers: [PaymentController],
  providers: [PaymentService, VnpayService],
  exports: [PaymentService],
})
export class PaymentModule {}
