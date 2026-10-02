# API (`apps/api`)

NestJS 11, Prisma 7, PostgreSQL. Modules listés dans `docs/architecture/architecture-monorepo.pdf`.
Chaque module suit le skill `new-api-module` ; chaque changement de schéma, le skill `db-migration`.

## Socle

- [x] Configuration validée au démarrage (`src/config/env.ts`), modèle `.env.example`
- [x] Prisma 7 + adaptateur PostgreSQL, migration initiale, script d'initialisation (`nx run api:seed`)
- [x] Format d'erreur unique (`code`, `message`, `details`, `requestId`), filtre global
- [x] Validation stricte des entrées (`whitelist`, `forbidNonWhitelisted`)
- [x] Identifiant de requête et journaux structurés (JSON en production)
- [x] En-têtes de sécurité (helmet), CORS restreint, limitation du débit
- [x] Documentation OpenAPI (`/api/docs` hors production) et export `nx run api:openapi`
- [x] Point de santé `/api/health`
- [ ] Erreurs 5xx envoyées à Sentry (filtrage des données personnelles)
- [ ] Limitation du débit partagée dans Redis (nécessaire dès plusieurs instances)
- [ ] Adresse IP réelle derrière Cloudflare (`CF-Connecting-IP`)
- [ ] Tests de bout en bout sur une vraie base dans la CI (service PostgreSQL)

## access — rôles et permissions

- [x] 16 permissions déclarées dans le code, 6 rôles système en base
- [x] Garde globale : refus par défaut, `@Public`, `@Authenticated`, `@RequirePermissions`
- [x] Statut et permissions relus à chaque requête (suspension immédiate)
- [ ] Routes de gestion des rôles (créer un rôle, changer ses permissions) — `roles.manage`
- [ ] Rôle « Responsable financier » (phase 2)

## auth — authentification

- [x] Inscription apprenant (session ouverte) et formateur (en attente de validation)
- [x] Connexion, mots de passe Argon2id, message neutre, blocage 15 min après 5 échecs
- [x] Cookies `HttpOnly` pour le web, jetons dans la réponse pour le mobile
- [x] Jeton d'accès 15 min, jeton de renouvellement haché, rotation, détection de réutilisation
- [x] Double authentification TOTP obligatoire pour super admin et admin APGO
- [x] Déconnexion, `GET /auth/me`
- [ ] Vérification de l'adresse email à l'inscription
- [ ] Mot de passe oublié (lien à usage unique par email)
- [ ] Modifier son profil, son mot de passe, sa langue
- [ ] Codes de secours pour la double authentification
- [ ] Liste et fermeture de ses sessions actives

## users — comptes

- [x] Liste paginée avec filtres (état, rôle, recherche), consultation
- [x] Valider, suspendre, réactiver, supprimer (anonymisation), sessions fermées
- [x] Protection de l'équipe d'administration et du super admin
- [ ] Créer un compte de l'équipe (admin, gestionnaire, service client) avec invitation
- [ ] Changer le rôle d'un compte (journalisé)
- [ ] Email au formateur quand son compte est validé ou refusé

## audit — journal

- [x] Enregistrement dans la même transaction que l'action
- [x] Ajout seul garanti par un déclencheur PostgreSQL
- [x] Consultation paginée et filtrée (`audit.read`)
- [ ] Export CSV

## Modules à venir

### media — médiathèque (phase 3)

- [ ] Modèle : contenu (vidéo, audio, document), catégorie, langue, auteur, date, traductions
- [ ] Catalogue public, recherche et filtres (Meilisearch)
- [ ] Envoi vers R2 (`MediaStorage`), types et tailles en liste blanche, noms régénérés
- [ ] Liens de téléchargement signés et temporaires, compteur de téléchargements
- [ ] Miniatures automatiques (Cloudinary), version allégée des vidéos
- [ ] Gestion réservée à `media.manage`, journalisée

### bible — Bible gouro (phase 3)

- [ ] Modèle : versions, livres, chapitres, versets
- [ ] Import USFM (`tools/bible-import`) : LSG 1910 d'abord, gouro à réception des fichiers
- [ ] Lecture, recherche par mot, lien direct vers un verset
- [ ] Audio par chapitre (liens R2)
- [ ] Paquets hors-ligne par livre avec leur taille
- [ ] Dernière position de lecture par utilisateur

### courses — formations (phase 4)

- [ ] Modèle : formation, modules, leçons (vidéo, texte, documents), traductions
- [ ] Espace formateur : créer, publier, ne voir que ses cours et élèves
- [ ] Catalogue public, suivi avec ou sans compte
- [ ] Progression sauvegardée, historique
- [ ] Supervision par l'admin (`courses.supervise`)

### exams — examens (phase 4)

- [ ] Banque de questions QCM par formation
- [ ] Réglages : note de réussite, durée, tentatives, délai avant de repasser
- [ ] Tirage aléatoire, questions et réponses mélangées, correction automatique

### certificates — certificats (phase 4)

- [ ] PDF généré à la réussite (maquette `design/maquettes/Certificat.dc.html`)
- [ ] Numéro unique non devinable, QR code, page publique de vérification
- [ ] Renvoi et régénération par le service client (journalisé)

### payments — paiement (phase 4)

- [ ] Interface unique, faux prestataire (simulation)
- [ ] Commandes, transactions, statuts, reçus
- [ ] Prix du certificat configurable (0 au lancement), offre de lancement
- [ ] Interrupteur simulation → réel réservé au super admin (journalisé)

### support — service client (phase 5)

- [ ] Formulaire de contact, FAQ
- [ ] Tickets : numéro, statut, historique, email à chaque réponse

### notifications

- [ ] Envoi d'emails (prestataire à choisir), modèles traduisibles
- [ ] Notifications mobiles Firebase

### Infrastructure

- [ ] `storage` : R2 et Cloudinary derrière `MediaStorage`
- [ ] `video` : YouTube et Jesus Film Project derrière `VideoProvider`
- [ ] `search` : Meilisearch
- [ ] `queue` : BullMQ (tentatives, alertes en cas d'échec)
