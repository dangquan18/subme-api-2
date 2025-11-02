import { Module } from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { SubscriptionController } from './subcription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
// import { Subcription } from './entities/subcription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubcriptionModule {}
