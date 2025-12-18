import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ApprovePlanDto {
  @IsEnum(['approved', 'rejected', 'pending'])
  status: 'approved' | 'rejected' | 'pending';

  @IsOptional()
  @IsString()
  reason?: string; // Lý do từ chối (nếu có)
}
