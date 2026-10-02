---
name: i18n
description: Règles de traduction APGO (français au lancement, gouro ensuite) pour l'interface Angular (Transloco), Flutter et les contenus de l'API. À appliquer chaque fois qu'on écrit un texte visible par l'utilisateur, un message d'erreur, un email ou un champ de contenu destiné à être traduit.
---

# Traduction (français, puis gouro)

Le lancement se fait en français ; le gouro arrive ensuite. Tout doit être prêt pour
ajouter le gouro **sans toucher au code** : seulement de nouveaux fichiers de traduction
et des contenus traduits.

## Règle de base

Aucun texte visible par l'utilisateur écrit en dur dans un composant, un écran, un
service ou un email. Chaque texte passe par une clé de traduction.

## Clés

- Format : `domaine.ecran.element`, en anglais, en camelCase :
  `courses.list.emptyTitle`, `auth.login.submit`, `errors.COURSE_ALREADY_PUBLISHED`.
- Les messages d'erreur utilisent le `code` de l'API : `errors.<CODE>` (voir le skill
  `error-handling`).
- Textes communs (boutons, états) sous `common.` : `common.retry`, `common.cancel`.

## Angular (Transloco)

- Fichiers dans `libs/i18n/src/lib/<langue>/<domaine>.json` (`fr`, puis `goa`, code ISO 639-3 du gouro), chargés
  par domaine à la demande pour garder les pages légères.
- Dans les gabarits : la directive ou le pipe `transloco` ; dans le code, le service.
- Le rendu serveur (SSR) produit la page dans la langue demandée ; l'URL porte la langue
  pour les pages publiques référencées (médiathèque, Bible).

## Flutter

- Fichiers ARB (`apps/mobile/lib/l10n/app_fr.arb`, puis `app_goa.arb`) avec
  `flutter_localizations` et la génération de code intégrée.
- Mêmes noms de clés que le web quand le texte est le même.

## Phrases

- Jamais de phrase construite par concaténation (`'Vous avez ' + n + ' formations'`) :
  utiliser des paramètres et le pluriel ICU
  (`{count, plural, =0 {Aucune formation} one {1 formation} other {{count} formations}}`).
- Prévoir des textes plus longs en gouro : pas de largeur fixe sur les boutons et libellés.
- Dates, nombres et prix formatés selon la langue (pas de format écrit à la main) ;
  montants en francs CFA (XOF).

## Contenus de l'API

Les contenus saisis par APGO (titres et descriptions de médias, formations, FAQ, noms des
livres de la Bible) sont stockés par langue dès maintenant (champ ou table de traduction
par langue), avec le français comme langue de repli quand la traduction manque.

## Police et caractères

Toujours tester l'affichage avec un vrai texte gouro (accents et lettres spéciales) ;
les fichiers de traduction sont en UTF-8.
