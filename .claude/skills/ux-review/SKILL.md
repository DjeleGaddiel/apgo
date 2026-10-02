---
name: ux-review
description: Audit UI/UX d'une page, d'un écran ou d'un dossier selon les règles APGO (mobile d'abord, états, accessibilité, identité visuelle, légèreté, textes).
argument-hint: <page, écran ou dossier> (ex. apps/web/src/app/course/list)
disable-model-invocation: true
---

# Audit UI/UX

Cible : `$ARGUMENTS`. Si rien n'est précisé, demander quelle page ou quel écran auditer.

Grille de référence : skill `ui-ux` (la charger en premier), complétée par `i18n` et
`error-handling` pour les textes et les messages d'erreur.

## Étapes

1. **Lire le code** de la cible : gabarits, styles, composant ou écran, et les données
   qu'il charge.
2. **Voir le rendu** quand c'est possible : lancer l'application (`npx nx serve web` ou
   `admin`) et ouvrir la page dans le navigateur intégré, en largeur **360 px** puis
   1280 px ; tester aussi la navigation au clavier. Si le rendu n'a pas pu être vu, le
   dire dans le rapport.
3. **Contrôler** chaque point de la grille :
   - mobile d'abord (360 px, zones cliquables, pas de défilement horizontal) ;
   - les quatre états : chargement, vide, erreur, hors-ligne ;
   - tokens uniquement (rechercher les couleurs, tailles et polices écrites en dur) ;
   - contrastes WCAG AA, texte de 16 px minimum, pas de doré sur blanc ;
   - sémantique et accessibilité (titres, `label`, `alt`, focus, rôle des boutons) ;
   - poids : images, chargement différé, dépendances lourdes ;
   - formulaires : libellés, validation, messages, double envoi ;
   - textes : aucun texte en dur, phrases claires, vouvoiement.
4. **Rapport**, classé par gravité :

   | Gravité | Problème | Où (fichier:ligne) | Correction proposée |
   | ------- | -------- | ------------------ | ------------------- |

   Bloquant = empêche un utilisateur d'agir ou d'accéder au contenu ; Important = gêne
   réelle ou non-respect de la charte ; Mineur = finition.

5. **Corriger** seulement si l'utilisateur le demande ; sinon proposer de corriger les
   points bloquants et importants.
