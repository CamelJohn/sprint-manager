import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvModule } from './env/env.module.js';
import { UsersModule } from './modules/users/users.module.js';

import { PrismaService } from './prisma/prisma.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EnvModule, UsersModule],
  providers: [PrismaService],
})
export class AppModule {}
