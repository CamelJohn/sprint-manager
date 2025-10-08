import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateProjectDto } from './dto/create-project.dto.js';
import type { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async findAll() {
    return this.prisma.project.findMany({ include: { organization: true } });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
