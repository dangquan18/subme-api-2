import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  subscription_id: number;

  @IsEnum(['VNPay', 'MoMo'])
  payment_method: 'VNPay' | 'MoMo';

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  return_url?: string;
}
