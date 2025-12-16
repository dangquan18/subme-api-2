import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;
}
