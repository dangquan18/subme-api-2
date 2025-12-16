import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/categories.entity';
import { Plan } from 'src/entities/plans.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Plan])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
