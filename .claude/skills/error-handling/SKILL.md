---
name: error-handling
description: Règles de gestion des erreurs APGO (format d'erreur unique de l'API, codes d'erreur, messages utilisateur en français, gestion côté Angular et Flutter, journaux et Sentry). À appliquer chaque fois qu'on écrit du code qui peut échouer, qui lève ou intercepte une erreur, ou qui affiche un message d'erreur.
---

# Gestion des erreurs APGO

Objectif : l'utilisateur comprend toujours ce qui se passe et quoi faire ; l'équipe
technique dispose de tout ce qu'il faut pour corriger, sans données personnelles.

## 1. Format unique des erreurs de l'API

Toutes les erreurs de l'API ont la même forme (filtre d'exception global dans `apps/api`) :

```json
{
  "statusCode": 409,
  "code": "COURSE_ALREADY_PUBLISHED",
  "message": "Cette formation est déjà publiée.",
  "details": [{ "field": "title", "code": "TOO_LONG" }],
  "requestId": "a1b2c3"
}
```

- `code` : constante stable en anglais, MAJUSCULES, préfixée par le domaine
  (`AUTH_`, `COURSE_`, `EXAM_`, `MEDIA_`, `BIBLE_`, `PAYMENT_`…). C'est ce que les clients
  utilisent pour choisir le message traduit. Les codes sont déclarés dans un fichier par
  module et documentés dans OpenAPI.
- `message` : texte français de secours, sans détail technique.
- `details` : erreurs de validation champ par champ.
- `requestId` : identifiant de la requête, présent aussi dans les journaux et Sentry.
- Erreur inattendue : statut 500, code `INTERNAL_ERROR`, message générique ; **jamais**
  de trace, de requête SQL ou de chemin de fichier dans la réponse.

Statuts : 400 données invalides, 401 non connecté, 403 interdit, 404 introuvable,
409 conflit, 422 règle métier non respectée, 429 trop de requêtes, 503 service externe
indisponible.

## 2. Dans le code de l'API

- Lever des exceptions métier explicites (`CourseAlreadyPublishedException`) plutôt que
  des `Error` génériques ou des `return null` silencieux.
- Appels aux services externes (R2, Cloudinary, YouTube, Jesus Film Project, email,
  paiement) : délai maximal, nouvelle tentative seulement si l'opération peut être rejouée
  sans risque, puis erreur 503 claire.
- Tâches de fond (BullMQ) : tentatives avec délai croissant ; après le dernier échec,
  journaliser et alerter, ne jamais perdre la tâche en silence.
- Ne jamais avaler une erreur (`catch {}` vide) : la traiter, la relancer ou la journaliser.

## 3. Côté Angular

- Un intercepteur HTTP central traduit `code` en message (via `i18n`), gère 401
  (renouvellement du jeton puis reconnexion) et les erreurs réseau.
- Erreur de chargement d'écran : état d'erreur avec « Réessayer » (skill `ui-ux`).
- Erreur de formulaire : messages sous les champs à partir de `details`, saisie conservée.
- `ErrorHandler` global relié à Sentry pour les erreurs non prévues.

## 4. Côté Flutter

- Le dépôt (`repository`) transforme les erreurs du client API en erreurs métier ;
  les écrans n'affichent jamais une exception brute.
- Distinguer « pas de connexion » (afficher le cache, proposer de réessayer) de
  « erreur du serveur ».
- Sentry pour les erreurs non prévues.

## 5. Journaux et Sentry

- Journaux structurés (JSON) avec `requestId`, utilisateur (identifiant seulement), route,
  durée, code d'erreur.
- Niveaux : `error` pour ce qui demande une action, `warn` pour l'anormal mais géré,
  `info` pour les événements métier importants.
- Jamais de mot de passe, jeton, numéro de téléphone complet ou donnée de paiement dans un
  journal ou dans Sentry (filtrer avant l'envoi).
- Les erreurs 4xx attendues ne vont pas dans Sentry ; les 5xx et les plantages, oui.

## 6. Messages à l'utilisateur

Français simple, sans jargon, avec ce qu'il peut faire : « La connexion a été interrompue.
Vérifiez votre réseau puis réessayez. » Jamais « Erreur 500 » ou « Unexpected token ».
