import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payments.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private userRepository: Repository<Payment>,
  ) {}
  createPayment(createPaymentDto: CreatePaymentDto) {
    const record = this.userRepository.create(createPaymentDto);
    return this.userRepository.save(record);
  }
  getAll() {
    return this.userRepository.find();
  }
}
