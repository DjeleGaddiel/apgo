import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Env } from '../config/env';
import { createValidationPipe } from '../common/errors/validation';

export const GLOBAL_PREFIX = 'api';

/** Réglages communs au serveur et à la génération du schéma OpenAPI. */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const express = app as NestExpressApplication;

  express.setGlobalPrefix(GLOBAL_PREFIX);
  // Derrière Coolify (proxy sur le réseau privé) : l'adresse du client vient de X-Forwarded-For.
  express.set('trust proxy', 'loopback, linklocal, uniquelocal');
  express.disable('x-powered-by');
  express.useBodyParser('json', { limit: '1mb' });

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    credentials: true,
  });
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();
}
