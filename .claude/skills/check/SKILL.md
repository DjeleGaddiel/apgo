---
name: check
description: Vérifie le projet avant un commit ou une pull request (format, lint, tests, build des projets modifiés) et corrige ce qui peut l'être.
disable-model-invocation: true
---

# Vérification avant commit

1. **Format** :

   ```bash
   npx nx format:check
   ```

   S'il y a des écarts : `npx nx format:write`.

2. **Lint, tests, build** des projets touchés par les modifications :

   ```bash
   npx nx affected -t lint test build --base=origin/main --exclude=mobile
   ```

   S'il n'y a pas encore de branche distante, utiliser
   `npx nx run-many -t lint test build --exclude=mobile`.

3. **Mobile** : si des fichiers de `apps/mobile` ou `packages/` ont changé et que Flutter
   est installé, lancer aussi `npx nx run mobile:lint` et `npx nx run mobile:test`.
   Si Flutter n'est pas installé, le signaler.

4. **Conventions** à contrôler sur les fichiers modifiés :
   - composants Angular sans `.component` dans le nom, autres types avec leur suffixe ;
   - pas de couleur en dur (variables `--apgo-*` côté web, `ApgoColors` côté Flutter) ;
   - aucun secret, aucun fichier `.env` dans les modifications (`git status`).

5. **Rapport** : lister ce qui passe, ce qui a été corrigé, et ce qui échoue encore avec
   l'erreur exacte. Ne pas annoncer « tout passe » si une étape n'a pas été lancée.
