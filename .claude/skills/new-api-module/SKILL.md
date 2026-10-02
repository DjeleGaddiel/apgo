---
name: new-api-module
description: Crée un module NestJS dans apps/api selon les conventions APGO (contrôleur, service, DTO validés, permissions par rôle, documentation OpenAPI, tests). À utiliser dès qu'on ajoute un domaine ou une ressource à l'API.
argument-hint: <nom-module> (ex. courses, media, tickets)
---

# Nouveau module d'API NestJS

Module demandé : `$ARGUMENTS` (kebab-case, au pluriel : `courses`, `media`, `support-tickets`).

Avant d'écrire, relire la section correspondante de `docs/cadrage/01-cahier-des-charges.pdf`
(rôles, règles métier) et la liste des modules dans `docs/architecture/architecture-monorepo.pdf`.

## Structure

```
apps/api/src/modules/<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── <module>.controller.spec.ts
├── <module>.service.ts
├── <module>.service.spec.ts
└── dto/
    ├── create-<entite>.dto.ts
    ├── update-<entite>.dto.ts
    └── <entite>.dto.ts           (réponse)
```

Les modules d'infrastructure (stockage, vidéo, recherche, file d'attente) vont dans
`apps/api/src/infrastructure/`, toujours derrière une interface (`MediaStorage`,
`VideoProvider`, `PaymentProvider`…) avec un jeton d'injection, jamais appelés directement.

## Étapes

1. **Générer** le squelette :

   ```bash
   npx nx g @nx/nest:resource apps/api/src/modules/<module>/<module> --type=rest --crud --no-interactive
   ```

   Le générateur crée aussi `entities/<entite>.entity.ts` : le supprimer, les modèles de
   données sont dans le schéma Prisma. Importer ensuite le module dans
   `apps/api/src/app/app.module.ts`.

2. **DTO** : `class-validator` sur chaque champ entrant, `@nestjs/swagger` (`@ApiProperty`)
   sur chaque champ. `UpdateXDto` étend `PartialType(CreateXDto)` de `@nestjs/swagger`.
   Ne jamais renvoyer une entité Prisma brute : mapper vers le DTO de réponse
   (pas de mot de passe, pas de champ interne).

3. **Permissions** : chaque route déclare qui peut l'appeler (décorateur de permission du
   module `access`). Les routes publiques (médiathèque, Bible, catalogue) sont marquées
   explicitement publiques. Un formateur ne voit que ses propres cours et élèves : filtrer
   dans le service, pas seulement dans le contrôleur.

4. **Documentation OpenAPI** : `@ApiTags('<module>')` sur le contrôleur, `@ApiOperation`
   et les réponses sur chaque route. Le client web et mobile est généré depuis ce schéma :
   après le module, lancer le skill `sync-api`.

5. **Données** : si de nouvelles tables sont nécessaires, utiliser le skill `db-migration`.

6. **Actions sensibles** (validation, suspension, suppression de comptes, changement de
   prix, interrupteur de paiement) : écrire une entrée dans le journal d'audit.

7. **Tests** : service testé avec les dépendances simulées ; au moins un test de refus
   d'accès par rôle.

8. **Vérifier** :

   ```bash
   npx nx run-many -t lint test build --projects=api
   ```

## Dépendances

Si elles ne sont pas encore installées, les ajouter à la première utilisation :
`@nestjs/swagger`, `class-validator`, `class-transformer` (et activer `ValidationPipe`
global avec `whitelist: true, forbidNonWhitelisted: true, transform: true` dans `main.ts`).
