---
name: new-flutter-feature
description: Crée une fonctionnalité dans l'application Flutter apps/mobile selon les conventions APGO (dossier par fonctionnalité, écrans, état, accès aux données, hors-ligne). À utiliser dès qu'on ajoute un écran ou un parcours dans l'application mobile.
argument-hint: <nom-fonctionnalite> (ex. bible, media, courses)
---

# Nouvelle fonctionnalité Flutter

Fonctionnalité : `$ARGUMENTS` (snake_case : `bible`, `media`, `course_exam`).

Vérifier d'abord que Flutter est installé (`flutter --version`) et que `apps/mobile`
contient les dossiers `android/` et `ios/` ; sinon, suivre `apps/mobile/README.md`.

## Structure

```
apps/mobile/lib/features/<fonctionnalite>/
├── data/
│   ├── <fonctionnalite>_repository.dart     accès API + cache local
│   └── <fonctionnalite>_local_store.dart    stockage hors-ligne (si besoin)
├── domain/
│   └── <modele>.dart                         modèles propres à l'app (si le client API ne suffit pas)
├── presentation/
│   ├── <fonctionnalite>_list_screen.dart
│   ├── <fonctionnalite>_detail_screen.dart
│   └── widgets/
└── <fonctionnalite>_routes.dart
test/features/<fonctionnalite>/
```

Noms de fichiers en snake_case, classes en PascalCase (`BibleListScreen`).

## Règles

- **Données** : passer par le client généré `packages/apgo_api` ; ne pas écrire d'appels
  HTTP à la main. Si une route manque, l'ajouter dans l'API puis lancer `sync-api`.
- **Connexion lente** : afficher le contenu en cache d'abord, puis rafraîchir ; prévoir
  un état hors-ligne explicite et des messages d'erreur compréhensibles.
- **Téléchargements** (Bible par livre, médias) : afficher la taille avant de télécharger,
  permettre l'annulation et la reprise.
- **Style** : uniquement `ApgoColors`, `ApgoFonts`, `ApgoSpacing` de `apgo_design`.
  Taille de texte de 16 minimum.
- **Textes** : en français, centralisés pour la traduction en gouro.

## Vérifier

```bash
npx nx run mobile:lint
npx nx run mobile:test
```
