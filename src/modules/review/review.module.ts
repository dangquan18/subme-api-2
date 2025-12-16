import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from 'src/entities/reviews.entity';
import { Plan } from 'src/entities/plans.entity';
import { Subscription } from 'src/entities/subscriptions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Plan, Subscription])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
