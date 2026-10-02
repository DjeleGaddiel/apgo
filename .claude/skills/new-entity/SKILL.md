---
name: new-entity
description: Crée une entité Angular complète dans apps/web ou apps/admin selon les conventions APGO (dossier par entité, sous-dossiers add/list/show, service, modèle, routes). À utiliser dès qu'on ajoute un écran de gestion ou un ensemble d'écrans pour une ressource (formation, contenu, ticket…).
argument-hint: <nom-entite> [web|admin] [écrans: add,list,show,edit]
---

# Nouvelle entité Angular

Arguments : `$ARGUMENTS`

- 1er : nom de l'entité en kebab-case, au singulier (ex. `course`, `media-item`).
- 2e : application, `web` ou `admin` (par défaut `admin`).
- 3e : écrans, séparés par des virgules (par défaut `add,list,show`).

Si le nom manque, le demander. Ne rien inventer sur les champs du modèle : s'ils ne sont
pas donnés, demander, ou les déduire du module correspondant de l'API (`apps/api/src/modules/`).

## Résultat attendu

```
apps/<app>/src/app/<entite>/
├── add/    <entite>-add.html · .ts · .scss · .spec.ts
├── list/   <entite>-list.html · .ts · .scss · .spec.ts
├── show/   <entite>-show.html · .ts · .scss · .spec.ts
├── <entite>.service.ts (+ .spec.ts)
├── <entite>.model.ts
└── <entite>.routes.ts
```

Classes : `CourseAdd`, `CourseList`, `CourseShow`, `CourseService`. Jamais de suffixe
`Component` ni de fichier `.component.ts`.

## Étapes

1. **Composants** : un appel par écran, avec le générateur Nx (les conventions de nommage
   sont déjà configurées dans `nx.json`) :

   ```bash
   npx nx g @nx/angular:component apps/<app>/src/app/<entite>/<ecran>/<entite>-<ecran> --no-interactive
   ```

2. **Service** :

   ```bash
   npx nx g @schematics/angular:service <entite> --project=<app> --path=apps/<app>/src/app/<entite> --no-interactive
   ```

   Le service appelle l'API via le client généré `libs/api-client` quand il existe ; sinon
   via `HttpClient`, avec des méthodes `list`, `get`, `create`, `update`, `remove`
   selon les écrans demandés.

3. **Modèle** `<entite>.model.ts` : interfaces TypeScript (`Course`, `CreateCourse`…).
   Quand `libs/api-client` existe, réexporter ses types au lieu de les redéclarer.

4. **Routes** `<entite>.routes.ts` :

   ```ts
   import { Routes } from '@angular/router';

   export const courseRoutes: Routes = [
     {
       path: '',
       loadComponent: () =>
         import('./list/course-list').then((m) => m.CourseList),
     },
     {
       path: 'add',
       loadComponent: () => import('./add/course-add').then((m) => m.CourseAdd),
     },
     {
       path: ':id',
       loadComponent: () =>
         import('./show/course-show').then((m) => m.CourseShow),
     },
   ];
   ```

   Puis brancher dans `apps/<app>/src/app/app.routes.ts` en chargement différé :
   `{ path: 'courses', loadChildren: () => import('./course/course.routes').then((m) => m.courseRoutes) }`
   (chemin d'URL au pluriel).

5. **Contenu des écrans** :
   - composants autonomes, `ChangeDetectionStrategy.OnPush`, état avec les signals ;
   - formulaires réactifs typés pour `add` / `edit` ;
   - styles avec les variables `--apgo-*` (jamais de couleur en dur) ;
   - textes visibles en français, prêts pour la traduction (pas de concaténation de phrases).

6. **Vérifier** :

   ```bash
   npx nx run-many -t lint test build --projects=<app>
   ```
