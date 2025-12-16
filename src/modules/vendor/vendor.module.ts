import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor } from 'src/entities/vendors.entity';
import { Plan } from 'src/entities/plans.entity';
import { Subscription } from 'src/entities/subscriptions.entity';
import { Payment } from 'src/entities/payments.entity';
import { Review } from 'src/entities/reviews.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, Plan, Subscription, Payment, Review])],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
