---
name: bible-import
description: Importe ou met à jour une version de la Bible (fichiers USFM de content/bible/) dans la base, la recherche et les paquets hors-ligne.
argument-hint: <version> (ex. lsg-1910, gouro-1979)
disable-model-invocation: true
---

# Import d'une version de la Bible

Version : `$ARGUMENTS` (un dossier de `content/bible/`). Lire d'abord `content/bible/README.md`.

## Contrôles avant l'import

1. Le dossier `content/bible/<version>/` contient des fichiers `.usfm`, un par livre,
   encodés en UTF-8.
2. Pour une version sous droits (gouro) : l'autorisation écrite de l'Alliance Biblique de
   Côte d'Ivoire a été reçue. En cas de doute, **demander** avant d'importer.
3. Vérifier un échantillon de versets avec des caractères propres au gouro
   (accents, lettres spéciales) : ils doivent être identiques au fichier source.

## Import

```bash
npx nx run bible-import:run --version=<version>
```

Le script (`tools/bible-import/`) :

1. lit les fichiers USFM et contrôle la structure (livres, chapitres, versets numérotés
   sans trou ni doublon) ; il s'arrête au premier problème et l'affiche ;
2. remplace la version dans PostgreSQL (dans une transaction) ;
3. réindexe les versets dans Meilisearch ;
4. génère un paquet hors-ligne par livre (SQLite compressé), calcule sa taille et l'envoie
   sur R2 ;
5. affiche un résumé : nombre de livres, chapitres, versets, taille de chaque paquet.

## Après l'import

Vérifier dans l'application web : un chapitre au hasard, une recherche par mot,
un lien direct vers un verset.

## Si le script n'existe pas encore

Le créer dans `tools/bible-import/` (projet Nx, TypeScript, cible `run`), en suivant
les étapes ci-dessus, et le tester d'abord sur `lsg-1910`.
