import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvModule } from './env/env.module.js';
import { UsersModule } from './modules/users/users.module.js';

import { PrismaService } from './prisma/prisma.service.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { SprintsModule } from './modules/sprints/sprints.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EnvModule,
    OrganizationsModule,
    ProjectsModule,
    UsersModule,
    SprintsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
