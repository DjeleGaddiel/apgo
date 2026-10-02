import { ConsoleLogger, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { configureApp, GLOBAL_PREFIX } from './app/configure-app';
import { createOpenApiDocument } from './app/openapi';
import type { Env } from './config/env';

async function bootstrap() {
  const production = process.env['NODE_ENV'] === 'production';
  const app = await NestFactory.create(AppModule, {
    // Journaux JSON en production, lisibles en développement.
    logger: new ConsoleLogger({ json: production, colors: !production }),
  });
  configureApp(app);

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    SwaggerModule.setup(
      `${GLOBAL_PREFIX}/docs`,
      app,
      createOpenApiDocument(app),
    );
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(
    `API APGO : http://localhost:${port}/${GLOBAL_PREFIX}`,
    'Bootstrap',
  );
}

bootstrap();
