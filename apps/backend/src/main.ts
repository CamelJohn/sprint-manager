import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { EnvService } from './env/env.service.js';

async function bootstarp() {
  const app = await NestFactory.create(AppModule);

  const { PORT, NODE_ENV } = new EnvService().get();

  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(3000);

  console.info(`Backend running in ${NODE_ENV} mode on http://localhost:${PORT}`);
}

bootstarp().catch(console.error);
