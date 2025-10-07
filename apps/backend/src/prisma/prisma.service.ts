import { type OnModuleInit, type OnModuleDestroy, Injectable } from '@nestjs/common';
import { prisma, PrismaClient } from '@sprint-manager/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
