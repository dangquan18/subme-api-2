import { IsNumber } from 'class-validator';

export class TestPaymentDto {
  @IsNumber()
  subscription_id: number;

  @IsNumber()
  amount: number;
}
