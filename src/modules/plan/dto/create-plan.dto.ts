import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  duration_value: number;

  @IsEnum(['ngày', 'tuần', 'tháng', 'năm'])
  duration_unit: 'ngày' | 'tuần' | 'tháng' | 'năm';

  @IsNumber()
  category_id: number;

  @IsString()
  @IsOptional()
  features?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
