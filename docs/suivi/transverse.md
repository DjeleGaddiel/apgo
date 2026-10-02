# Transverse

Ce qui est partagé entre les projets ou ne relève d'aucun en particulier.

## Design (`design/`, `libs/ui`)

- [x] Maquettes des 7 écrans de référence (`design/maquettes/`)
- [x] Tokens complétés et générés pour le web et Flutter
- [x] Composants `libs/ui` : bouton, carte, badge, barre de progression, verset, icône, logo
- [ ] Logo officiel d'APGO (remplace le logo provisoire) ❓
- [ ] Test de rendu des polices avec un vrai texte gouro ❓ (extrait à fournir par APGO)
- [ ] Polices WOFF2 auto-hébergées dans `design/fonts/`
- [ ] Composants à venir : champ de formulaire, liste de médias, pastilles de statut système

## Traductions (`libs/i18n`)

- [x] Transloco, chargement par domaine, rendu serveur
- [ ] Traduction de l'interface en gouro (phase 2 du projet)

## Contenus (`content/`, `tools/`)

- [ ] Bible LSG 1910 au format USFM dans `content/bible/lsg-1910`
- [ ] Bible gouro : fichiers officiels de l'Alliance Biblique de Côte d'Ivoire ⏸️ (demande envoyée)
- [ ] Script `tools/bible-import`
- [ ] Inventaire et migration du 1 To de ressources (`tools/media-migration`) ❓ répartition inconnue

## Infrastructure (`infra/`)

- [x] `docker-compose.yml` : PostgreSQL, Redis, Meilisearch
- [ ] Docker Desktop sur le poste de développement (en attendant : `npx prisma dev`)
- [ ] Serveur VPS avec Coolify, Cloudflare devant
- [ ] Sauvegardes PostgreSQL automatiques vers R2, test de restauration
- [ ] Sentry et Uptime Kuma
- [ ] Domaine et emails

## Intégration continue (`.github/workflows/`)

- [x] Lint, tests, build des projets modifiés
- [ ] Ouvrir la pull request de `api/fondations` et vérifier la CI
- [ ] Base PostgreSQL de test dans la CI
- [ ] Déploiement automatique
- [ ] Dependabot
