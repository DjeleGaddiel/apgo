# APGO Mobile (Flutter)

## Première installation

1. Installer Flutter : https://docs.flutter.dev/get-started/install
2. Générer les dossiers Android et iOS (une seule fois) :

   ```bash
   npx nx run mobile:setup
   ```

   `flutter create .` complète le projet sans écraser `lib/` ni `pubspec.yaml`.

3. Installer les dépendances puis lancer :

   ```bash
   npx nx run mobile:get
   npx nx run mobile:serve
   ```

## Organisation

- `lib/features/<fonctionnalité>/` : un dossier par fonctionnalité (media, courses, bible, account)
- `lib/core/` : configuration, client API, stockage local
- Couleurs et polices : package `apgo_design` (généré, ne pas modifier)
- Client API : package `apgo_api` (généré, ne pas modifier)
