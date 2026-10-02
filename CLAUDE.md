# APGO

Monorepo Nx : API NestJS, web et admin Angular, mobile Flutter.

Documents de référence dans `docs/` : cahier des charges (`docs/cadrage/`), architecture
(`docs/architecture/`), courriers aux partenaires (`docs/courriers/`).

## Conventions Angular (apps/web, apps/admin)

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
(`GadielService`, `AuthGuard`…). Ce suffixe est forcé dans la configuration des
générateurs Nx (`nx.json`), car Angular 20+ l'omet par défaut.

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
