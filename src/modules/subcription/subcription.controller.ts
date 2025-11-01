import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { CreateSubcriptionDto } from './dto/create-subcription.dto';
import { UpdateSubcriptionDto } from './dto/update-subcription.dto';

@Controller('subcription')
export class SubcriptionController {
  constructor(private readonly subcriptionService: SubcriptionService) {}

  @Post()
  create(@Body() createSubcriptionDto: CreateSubcriptionDto) {
    return this.subcriptionService.create(createSubcriptionDto);
  }

  @Get()
  findAll() {
    return this.subcriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcriptionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubcriptionDto: UpdateSubcriptionDto,
  ) {
    return this.subcriptionService.update(+id, updateSubcriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcriptionService.remove(+id);
  }
}
