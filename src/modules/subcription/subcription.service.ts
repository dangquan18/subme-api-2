import { Injectable } from '@nestjs/common';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
import { UpdateSubcriptionDto } from './dto/update-subcription.dto';

@Injectable()
export class SubcriptionService {
  create(createSubcriptionDto: CreateSubcriptionDto) {
    return 'This action adds a new subcription';
  }

  findAll() {
    return `This action returns all subcription`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subcription`;
  }

  update(id: number, updateSubcriptionDto: UpdateSubcriptionDto) {
    return `This action updates a #${id} subcription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subcription`;
  }
}
