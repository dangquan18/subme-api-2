import { Module } from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { SubscriptionController } from './subcription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Plan } from 'src/entities/plans.entity';
// import { Subcription } from './entities/subcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Plan])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubcriptionModule {}
