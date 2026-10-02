// Configuration de la CLI Prisma (schéma et migrations de apps/api). Variables lues dans `.env`.
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  migrations: {
    path: 'apps/api/prisma/migrations',
    seed: 'node -r @swc-node/register apps/api/prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
