// Écrit apps/api/openapi.json sans démarrer le serveur ni se connecter à la base.
// Lancement : npx nx run api:openapi
import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Valeurs factices : la génération n'a besoin d'aucun secret réel.
process.env['DATABASE_URL'] ??=
  'postgresql://openapi:openapi@localhost:5432/openapi';
process.env['JWT_ACCESS_SECRET'] ??= 'generation-openapi-sans-secret-reel-000';
process.env['TWO_FACTOR_ENCRYPTION_KEY'] ??=
  Buffer.alloc(32).toString('base64');
process.env['CORS_ORIGINS'] ??= 'http://localhost:4200';

async function generate() {
  const { AppModule } = await import('./app/app.module');
  const { configureApp } = await import('./app/configure-app');
  const { createOpenApiDocument } = await import('./app/openapi');

  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureApp(app);
  const document = createOpenApiDocument(app);
  const output = join(__dirname, '..', 'openapi.json');
  writeFileSync(output, JSON.stringify(document, null, 2) + '\n');
  await app.close();
  console.log(`Schéma OpenAPI écrit : ${output}`);
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
