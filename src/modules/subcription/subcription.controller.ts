import { Controller, Post, Body, Get } from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
// import { UpdateSubcriptionDto } from './dto/update-subcription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  create(@Body() createSubcriptionDto: CreateSubcriptionDto) {
    // const user_id = req.user.user_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
