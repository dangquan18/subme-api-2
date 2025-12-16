import { IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPackagesDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  vendor?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  max_price?: number;

  @IsOptional()
  @IsEnum(['ngày', 'tuần', 'tháng', 'năm'])
  duration_unit?: 'ngày' | 'tuần' | 'tháng' | 'năm';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(['price_asc', 'price_desc', 'popular', 'newest'])
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest' = 'newest';
}
