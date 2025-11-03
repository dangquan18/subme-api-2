import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payments.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Notification } from 'src/entities/notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Subscription, Notification])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
