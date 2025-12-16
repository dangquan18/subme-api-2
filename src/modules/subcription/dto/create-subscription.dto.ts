import { IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNumber()
  plan_id: number;

  @IsOptional()
  @IsEnum(['VNPay', 'MoMo'])
  payment_method?: 'VNPay' | 'MoMo' = 'VNPay';

  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean = true;
}
