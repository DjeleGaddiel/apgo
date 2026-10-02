---
name: db-migration
description: Modifie le schéma de base de données PostgreSQL de l'API (Prisma) et crée la migration correspondante, de façon sûre. À utiliser dès qu'on ajoute, renomme ou supprime une table ou une colonne.
argument-hint: <description courte du changement>
---

# Migration de base de données (Prisma)

Changement demandé : `$ARGUMENTS`

Le schéma est dans `apps/api/prisma/schema.prisma`, les migrations dans
`apps/api/prisma/migrations/`. La base locale tourne avec
`docker compose -f infra/docker-compose.yml up -d` (variables dans `.env`, voir `.env.example`).

## Étapes

1. **Modifier** `schema.prisma`.
   - Tables et modèles en anglais, au singulier, PascalCase (`Course`, `MediaItem`) ;
     colonnes en camelCase ; `@@map` vers des noms de tables en snake_case au pluriel.
   - Chaque modèle a `id`, `createdAt`, `updatedAt`.
   - Les textes destinés à être traduits en gouro sont prévus multilingues dès maintenant.
2. **Créer la migration** avec un nom explicite :

   ```bash
   npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name <nom_explicite>
   ```

3. **Relire le SQL généré** dans `migrations/<date>_<nom>/migration.sql` avant de continuer.
4. **Vérifier** : `npx nx run-many -t lint test build --projects=api`.

## Règles de sécurité

- Ne jamais modifier une migration déjà commitée : en créer une nouvelle.
- Suppression ou renommage de colonne contenant des données : **demander confirmation**
  et prévoir la reprise des données (renommage = nouvelle colonne, copie, puis suppression
  dans une migration suivante).
- Ne jamais lancer `prisma migrate reset` ni `prisma db push` sur une base autre que la
  base locale de développement.

## Première mise en place

Si Prisma n'est pas encore installé : `npm install -D prisma` et `npm install @prisma/client`,
puis `npx prisma init --schema apps/api/prisma/schema.prisma --datasource-provider postgresql`,
et un `PrismaService` injectable dans `apps/api/src/infrastructure/database/`.
