---
name: debug
description: Analyse et corrige une erreur ou un bug APGO (message d'erreur, comportement inattendu, test qui échoue, plantage) en trouvant la cause, en la corrigeant et en ajoutant un test pour qu'elle ne revienne pas.
argument-hint: <message d'erreur, symptôme ou lien Sentry>
disable-model-invocation: true
---

# Analyse et correction d'une erreur

Problème : `$ARGUMENTS`. S'il manque des informations (message exact, écran concerné,
étapes pour reproduire, web ou mobile), les demander avant de chercher.

## Étapes

1. **Comprendre** : où l'erreur apparaît (API, web, admin, mobile), depuis quand,
   pour qui (tous les utilisateurs, un rôle, un appareil). Récupérer le `requestId` s'il
   existe pour retrouver la requête dans les journaux.
2. **Reproduire** : écrire un test qui échoue à cause du bug, ou à défaut une suite d'étapes
   précise. Ne pas corriger avant d'avoir reproduit, sauf si c'est impossible : le dire.
3. **Trouver la cause** : remonter du symptôme jusqu'à l'origine ; vérifier l'hypothèse
   (journal, test, lecture du code) plutôt que de la supposer. Chercher si la même cause
   touche d'autres endroits.
4. **Corriger la cause**, pas le symptôme : pas de `try/catch` qui masque, pas de valeur
   par défaut qui cache une donnée manquante. Respecter les skills `error-handling` et,
   si le bug touche les droits d'accès, `security`.
5. **Vérifier** : le test de l'étape 2 passe, puis

   ```bash
   npx nx affected -t lint test build --exclude=mobile
   ```

6. **Rapport** en quelques lignes : la cause, la correction (fichiers modifiés), le test
   ajouté, et les autres endroits éventuellement concernés.
