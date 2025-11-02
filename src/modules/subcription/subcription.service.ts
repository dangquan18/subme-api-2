import { Injectable } from '@nestjs/common';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
import { InjectRepository } from '@nestjs/typeorm';
// import { Subcription } from './entities/subcription.entity';
import { Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
// import { UpdateSubcriptionDto } from './dto/update-subcription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private repo: Repository<Subscription>,
  ) {}

  // Post Subscription ( gói đăng kí)
  createNew(dto: CreateSubcriptionDto) {
    return this.repo.create(dto);
  }
  findAll() {
    return this.repo.find();
  }
}
