import { Injectable } from '@nestjs/common';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Plan } from 'src/entities/plans.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) {}

  // 👉 Tạo mới một subscription
  async createNew(dto: CreateSubcriptionDto) {
    const start_date = new Date();

    const plan = await this.planRepo.findOne({
      where: { id: dto.plan_id },
    });

    if (!plan) {
      throw new Error(`Không tìm thấy gói đăng ký với id: ${dto.plan_id}`);
    }

    // Tính toán end_date dựa vào plan
    const end_date = this.calculateEndDate(
      start_date,
      plan.duration_value,
      plan.duration_unit,
    );

    // Tạo bản ghi Subscription
    const createRecord = this.repo.create({
      ...dto,
      start_date,
      end_date,
    });

    return this.repo.save(createRecord);
  }

  //  Hàm tính end_date dựa trên start_date và duration của plan
  private calculateEndDate(start: Date, value: number, unit: string): Date {
    const end = new Date(start);
    switch (unit) {
      case 'day':
        end.setDate(end.getDate() + value);
        break;
      case 'week':
        end.setDate(end.getDate() + value * 7);
        break;
      case 'month':
        end.setMonth(end.getMonth() + value);
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + value);
        break;
      default:
        throw new Error(`Đơn vị thời gian không hợp lệ: ${unit}`);
    }
    return end;
  }
  findAll() {
    return this.repo.find();
  }
}
