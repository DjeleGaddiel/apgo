import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { Env } from '../../config/env';
import { AccessGuard } from './access.guard';
import { AccessTokenService } from './access-token.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
      }),
    }),
  ],
  providers: [
    AccessTokenService,
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
  exports: [AccessTokenService],
})
export class AccessModule {}
