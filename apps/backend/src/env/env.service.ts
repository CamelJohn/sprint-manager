import { Injectable } from '@nestjs/common';
import { cleanEnv, port, str } from 'envalid';

@Injectable()
export class EnvService {
  private env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'staging', 'test'] }),
    PORT: port({ default: 3000 }),
  });

  constructor() {}

  get() {
    return this.env;
  }
}
