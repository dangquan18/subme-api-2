import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/reviews.entity';
import { Plan } from 'src/entities/plans.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {}

  /**
   * GET /reviews/plan/:planId - Danh sách đánh giá của gói
   */
  async findByPlan(
    planId: number,
    limit: number = 20,
    offset: number = 0,
    sort: string = 'newest',
  ) {
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.plan_id = :planId', { planId });

    // Apply sorting
    switch (sort) {
      case 'highest':
        queryBuilder.orderBy('review.rating', 'DESC');
        break;
      case 'lowest':
        queryBuilder.orderBy('review.rating', 'ASC');
        break;
      case 'newest':
      default:
        queryBuilder.orderBy('review.createdAt', 'DESC');
        break;
    }

    queryBuilder.skip(offset).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Calculate average rating
    const avgResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.plan_id = :planId', { planId })
      .getRawOne();

    return {
      reviews,
      total,
      average_rating: parseFloat(avgResult.average) || 0,
      limit,
      offset,
    };
  }

  /**
   * POST /reviews - Tạo đánh giá
   */
  async create(userId: number, dto: CreateReviewDto) {
    const { plan_id, rating, comment } = dto;

    // Check if plan exists
    const plan = await this.planRepo.findOne({ where: { id: plan_id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if user has subscribed to this plan
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        user_id: userId,
        plan_id,
        status: 'active',
      },
    });

    if (!subscription) {
      throw new BadRequestException('You must subscribe to this plan before reviewing');
    }

    // Check if user already reviewed this plan
    const existingReview = await this.reviewRepo.findOne({
      where: {
        user_id: userId,
        plan_id,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this plan');
    }

    // Create review
    const review = this.reviewRepo.create({
      user_id: userId,
      plan_id,
      rating,
      comment,
    });

    await this.reviewRepo.save(review);

    // Update plan's average rating
    await this.updatePlanAverageRating(plan_id);

    return {
      success: true,
      message: 'Review created successfully',
      review,
    };
  }

  /**
   * PATCH /reviews/:id - Cập nhật đánh giá
   */
  async update(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, dto);
    await this.reviewRepo.save(review);

    // Update plan's average rating
    await this.updatePlanAverageRating(review.plan_id);

    return {
      success: true,
      message: 'Review updated successfully',
      review,
    };
  }

  /**
   * DELETE /reviews/:id - Xóa đánh giá
   */
  async remove(id: number, userId: number) {
    const review = await this.reviewRepo.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const planId = review.plan_id;
    await this.reviewRepo.remove(review);

    // Update plan's average rating
    await this.updatePlanAverageRating(planId);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  /**
   * Helper: Update plan's average rating
   */
  private async updatePlanAverageRating(planId: number) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.plan_id = :planId', { planId })
      .getRawOne();

    const avgRating = parseFloat(result.average) || 0;

    await this.planRepo.update(planId, {
      average_rating: avgRating,
    });
  }
}
