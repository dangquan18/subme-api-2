import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/entities/categories.entity';
import { Plan } from 'src/entities/plans.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: { id: 'ASC' },
    });

    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      return null;
    }

    // Get packages in this category
    const packages = await this.planRepository.find({
      where: { 
        category_id: id,
        status: 'approved',
        is_active: true,
      },
      relations: ['vendor'],
    });

    return {
      ...category,
      packages,
    };
  }
}
