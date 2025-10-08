import { Module } from '@nestjs/common';
import { SprintsService } from './sprints.service.js';
import { SprintsController } from './sprints.controller.js';
import { PrismaService } from 'src/prisma/prisma.service.js';

@Module({
  controllers: [SprintsController],
  providers: [SprintsService, PrismaService],
  exports: [SprintsService],
})
export class SprintsModule {}
