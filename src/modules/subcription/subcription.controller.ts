import { Controller, Post, Body, Get } from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
// import { UpdateSubcriptionDto } from './dto/update-subcription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubcriptionDto: CreateSubcriptionDto) {
    return this.subscriptionService.createNew(createSubcriptionDto);
  }
  @Get()
  findAll() {
    try {
      return this.subscriptionService.findAll();
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
}
