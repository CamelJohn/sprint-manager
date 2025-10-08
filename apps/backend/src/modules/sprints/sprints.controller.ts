import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SprintsService } from './sprints.service.js';
import type { CreateSprintDto } from './dto/create-sprint.dto.js';
import type { UpdateSprintDto } from './dto/update-sprint.dto.js';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  create(@Body() dto: CreateSprintDto) {
    return this.sprintsService.create(dto);
  }

  @Get()
  findAll() {
    return this.sprintsService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sprintsService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    return this.sprintsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sprintsService.delete(id);
  }
}
