import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from '../config/env';
import { AllExceptionsFilter } from '../common/errors/all-exceptions.filter';
import { RequestContextMiddleware } from '../common/http/request-context.middleware';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { AccessModule } from '../modules/access/access.module';
import { AuditModule } from '../modules/audit/audit.module';
import { AuthModule } from '../modules/auth/auth.module';
import { HealthModule } from '../modules/health/health.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    // Limite globale par adresse IP ; les routes sensibles ont leur propre limite plus basse.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    DatabaseModule,
    AccessModule,
    AuditModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('{*path}');
  }
}
