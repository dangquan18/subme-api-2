import { Injectable } from '@nestjs/common';
// import { CreatePlanDto } from './dto/create-plan.dto';
// import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from 'src/entities/plans.entity';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private userRepository: Repository<Plan>,
  ) {}

  // Lấy danh sách Gói dịch vụ
  async getAll(): Promise<Plan[]> {
    return this.userRepository.find();
  }
  // Xem chi tiết Gói dịch vụ theo id
  async getById(id: number): Promise<Plan[]> {
    return this.userRepository.findBy({ id });
  }
  // Tạo Gói mới
  async createNew(createDto: CreatePlanDto): Promise<Plan> {
    return this.userRepository.create(createDto);
  }
  // Xem list Gói của user
  async getByUser(userId: number): Promise<Plan[]> {
    return this.userRepository.findBy({ vendor_id: userId });
  }
}
