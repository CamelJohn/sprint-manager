import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { type Sprint } from '@sprint-manager/db/generated/client/index.js';
import type { CreateSprintDto } from './dto/create-sprint.dto.js';
import type { UpdateSprintDto } from './dto/update-sprint.dto.js';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSprintDto): Promise<Sprint> {
    return this.prisma.sprint.create({
      data: dto,
    });
  }

  async getAll(): Promise<Sprint[]> {
    return this.prisma.sprint.findMany();
  }

  async getById(id: string): Promise<Sprint | null> {
    return this.prisma.sprint.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateSprintDto): Promise<Sprint> {
    const data: Partial<Pick<Sprint, 'name' | 'status' | 'startDate' | 'endDate'>> = {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };

    return this.prisma.sprint.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Sprint> {
    return this.prisma.sprint.delete({ where: { id } });
  }
}
