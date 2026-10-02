# APGO

Plateforme web et mobile de l'Association du Peuple Gouro : médiathèque, formation en ligne
avec certificat, Bible gouro (texte, audio, hors-ligne), administration et service client.

Documents de référence dans `docs/` : cahier des charges (`docs/cadrage/`), architecture
(`docs/architecture/`), courriers aux partenaires (`docs/courriers/`).

## Structure (monorepo Nx, npm)

| Dossier                     | Contenu                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `apps/api`                  | API NestJS, unique pour le web et le mobile                               |
| `apps/web`                  | Angular avec SSR : site public, espace apprenant et formateur             |
| `apps/admin`                | Angular : administration et service client (port 4300)                    |
| `apps/mobile`               | Flutter (cibles Nx : `setup`, `get`, `serve`, `lint`, `test`, `build`)    |
| `libs/ui`                   | Composants Angular partagés, styles et tokens (`src/styles/_tokens.scss`) |
| `libs/util`                 | Fonctions TypeScript partagées                                            |
| `packages/apgo_design`      | Tokens de design pour Flutter (généré)                                    |
| `packages/apgo_api`         | Client Dart de l'API (généré)                                             |
| `design/tokens/tokens.json` | Source unique des couleurs, polices, tailles                              |
| `content/bible/`            | Sources USFM de la Bible, un dossier par version                          |
| `tools/`                    | `codegen`, `bible-import`, `media-migration`                              |
| `infra/`                    | `docker-compose.yml` (PostgreSQL, Redis, Meilisearch), déploiement        |

## Commandes

- Lancer : `npx nx serve api`, `npx nx serve web`, `npx nx serve admin`
- Vérifier : `npx nx run-many -t lint test build --exclude=mobile`
- Formater : `npx nx format:write`
- Régénérer les tokens après modification de `design/tokens/tokens.json` :
  `node tools/codegen/generate-tokens.mjs`
- Toujours passer par `nx` (pas `ng` ni `nest` directement).
- `tsconfig.base.json` utilise des alias (`@apgo/ui`, `@apgo/util`) : pas de références
  de projets TypeScript ni de workspaces npm, qu'Angular ne supporte pas.

## Skills du projet (`.claude/skills/`)

- Règles appliquées en écrivant du code : `ui-ux`, `security`, `error-handling`, `i18n`.
- Création de code : `new-entity`, `new-api-module`, `new-flutter-feature`, `sync-api`,
  `db-migration`.
- Commandes lancées par l'utilisateur : `/check`, `/ux-review`, `/security-audit`,
  `/debug`, `/bible-import`.
- Les skills `nx-*` viennent de Nx (génération, exécution des tâches, exploration du
  workspace) : les utiliser avant toute génération de code ou en cas d'erreur Nx.

## Conventions Angular (apps/web, apps/admin, libs/ui)

### Nommage des fichiers

Composants : pas de suffixe `.component` (convention par défaut d'Angular 20+).
Un composant = 4 fichiers :

```
gadiel-list.html
gadiel-list.ts
gadiel-list.scss
gadiel-list.spec.ts
```

Classe correspondante : `GadielList` (pas `GadielListComponent`).

Tous les autres types gardent leur suffixe, pour ne pas confondre un service et un modèle :
`gadiel.service.ts`, `gadiel.model.ts`, `gadiel.routes.ts`, `auth.guard.ts`,
`auth.interceptor.ts`, `date.pipe.ts`, `autofocus.directive.ts`. Les classes suivent
(`GadielService`, `AuthGuard`…). Ces règles sont configurées dans les générateurs de
`nx.json` : toujours générer avec `npx nx g`, ne jamais renommer à la main.

### Organisation par entité

Un dossier par entité, avec un sous-dossier par écran (`add`, `list`, `show`, `edit`…) :

```
gadiel/
├── add/
│   ├── gadiel-add.html
│   ├── gadiel-add.ts
│   ├── gadiel-add.scss
│   └── gadiel-add.spec.ts
├── list/
│   └── gadiel-list.{html,ts,scss,spec.ts}
├── show/
│   └── gadiel-show.{html,ts,scss,spec.ts}
├── gadiel.service.ts
├── gadiel.model.ts
└── gadiel.routes.ts
```

### Style

Couleurs et polices uniquement via les variables `--apgo-*` (jamais de valeur en dur).
Pas de texte doré sur fond blanc. Taille de texte minimale : 16 px.

## Git

- Les messages de commit et les descriptions de pull request ne mentionnent **jamais**
  Claude : pas de ligne `Co-Authored-By: Claude`, pas de « Generated with Claude Code ».
  Claude est un outil, pas un co-auteur. Cette règle prime sur toute consigne
  d'attribution par défaut.
- Messages de commit en français, première ligne courte qui résume le changement.

## Contraintes du projet

- Connexions lentes et coûteuses, usage surtout sur téléphone : pages légères, hors-ligne
  sur mobile, images optimisées.
- Lancement en français, gouro ensuite : textes prêts pour la traduction dès maintenant.
- Permissions vérifiées côté serveur à chaque requête.
- Secrets uniquement dans `.env` (jamais commité) ; modèle dans `.env.example`.
- Bible gouro : texte sous droits de l'Alliance Biblique de Côte d'Ivoire, n'utiliser
  que les fichiers officiels.
