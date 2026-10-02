---
name: sync-api
description: Régénère les clients de l'API (TypeScript pour Angular dans libs/api-client, Dart pour Flutter dans packages/apgo_api) à partir du schéma OpenAPI de apps/api. À utiliser après toute modification d'une route, d'un DTO ou d'un module de l'API.
---

# Synchroniser les clients de l'API

L'API NestJS est la seule source de vérité. Les clients web et mobile sont **générés**,
jamais écrits à la main : ne jamais modifier `libs/api-client/src/generated/` ni
`packages/apgo_api/lib/` directement.

## Étapes

1. **Exporter le schéma** : `npx nx run api:openapi` écrit `apps/api/openapi.json`.
2. **Générer les clients** :

   ```bash
   npx nx run api-client:generate     # TypeScript (Angular), dans libs/api-client
   npx nx run mobile:generate-api     # Dart, dans packages/apgo_api
   ```

3. **Vérifier** que les applications compilent avec le nouveau client :

   ```bash
   npx nx run-many -t lint test build --projects=web,admin,api-client
   ```

   Côté mobile, si Flutter est installé : `npx nx run mobile:lint`.

4. Commiter `openapi.json` et les clients générés **dans le même commit** que la
   modification de l'API.

## Première mise en place (à faire une seule fois)

Si les cibles ci-dessus n'existent pas encore, les créer avant de continuer :

- `api:openapi` : un script `apps/api/src/openapi.ts` qui démarre l'application Nest sans
  écouter de port, construit le document avec `SwaggerModule.createDocument` et l'écrit
  dans `apps/api/openapi.json`.
- `libs/api-client` : bibliothèque Angular créée avec
  `npx nx g @nx/angular:library libs/api-client --name=api-client --importPath=@apgo/api-client`,
  avec une cible `generate` qui utilise `@openapitools/openapi-generator-cli`
  (générateur `typescript-angular`) vers `libs/api-client/src/generated`.
- `mobile:generate-api` : même outil, générateur `dart-dio`, vers `packages/apgo_api`,
  puis ajouter `apgo_api` aux dépendances de `apps/mobile/pubspec.yaml`.

L'outil de génération demande Java : vérifier `java -version`. S'il est absent, le signaler
plutôt que d'écrire le client à la main.
