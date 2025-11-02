import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  subscription_id: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  @IsEnum(['VNPay', 'MoMo'])
  method: 'VNPay' | 'MoMo';

  @IsOptional()
  @IsEnum(['success', 'pending', 'failed'])
  status?: 'success' | 'pending' | 'failed';

  @IsOptional()
  @IsString()
  transaction_id?: string;
}
