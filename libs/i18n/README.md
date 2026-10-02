# @apgo/i18n

Traductions de l'interface Angular (Transloco) : `provideApgoI18n()` dans la configuration
de l'application, puis `provideTranslocoScope('<domaine>')` sur la route de chaque domaine.

Fichiers : `src/lib/<langue>/<domaine>.json` (`fr`, puis `goa` pour le gouro). Le domaine
`common` est chargé au démarrage. Chaque nouveau fichier se déclare dans
`src/lib/apgo-transloco.loader.ts`. Règles complètes : skill `i18n`.
