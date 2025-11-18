import { Module } from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { SubscriptionController } from './subcription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Plan } from 'src/entities/plans.entity';
import { Payment } from 'src/entities/payments.entity';
import { Notification } from 'src/entities/notifications.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan, Payment, Notification, User]),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubcriptionModule {}
