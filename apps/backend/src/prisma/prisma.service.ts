import { type OnModuleInit, type OnModuleDestroy, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '@sprint-manager/db';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  get db() {
    return this.client;
  }
}
