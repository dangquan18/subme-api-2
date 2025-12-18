import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ApproveVendorDto {
  @IsEnum(['approved', 'active', 'rejected', 'pending'])
  status: 'approved' | 'active' | 'rejected' | 'pending';

  @IsOptional()
  @IsString()
  reason?: string; // Lý do từ chối (nếu có)
}
