import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * GET /reviews/plan/:planId - Danh sách đánh giá của gói
   */
  @Get('plan/:planId')
  findByPlan(
    @Param('planId', ParseIntPipe) planId: number,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('offset', ParseIntPipe) offset: number = 0,
    @Query('sort') sort: string = 'newest',
  ) {
    return this.reviewService.findByPlan(planId, limit, offset, sort);
  }

  /**
   * POST /reviews - Tạo đánh giá
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewService.create(req.user.userId, dto);
  }

  /**
   * PATCH /reviews/:id - Cập nhật đánh giá
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(id, req.user.userId, dto);
  }

  /**
   * DELETE /reviews/:id - Xóa đánh giá
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.reviewService.remove(id, req.user.userId);
  }
}
