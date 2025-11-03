import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // API gộp: Tạo subscription + payment luôn
  @Post('purchase')
  async purchasePlan(
    @Body() body: { user_id: number; plan_id: number; payment_method: string },
  ) {
    return this.subscriptionService.purchasePlan(
      body.user_id,
      body.plan_id,
      body.payment_method,
    );
  }

  // Tạo subscription riêng (nếu cần tách biệt)
  @Post()
  async create(@Body() createSubcriptionDto: CreateSubcriptionDto) {
    return this.subscriptionService.createNew(createSubcriptionDto);
  }

  // Lấy tất cả subscription
  @Get()
  async findAll() {
    try {
      return this.subscriptionService.findAll();
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }

  // Lấy danh sách gói đã mua của user
  @Get('user/:userId')
  async getSubscriptionsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.subscriptionService.getSubscriptionsByUser(userId);
  }

  // Lấy danh sách gói đang active của user
  @Get('user/:userId/active')
  async getActiveSubscriptionsByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.subscriptionService.getActiveSubscriptionsByUser(userId);
  }

  // Lấy chi tiết 1 subscription
  @Get(':id')
  async getSubscriptionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.getSubscriptionDetail(id);
  }
}
