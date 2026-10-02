# Suivi du projet APGO

Tableau de bord de l'avancement. Chaque projet a sa liste détaillée ; ce fichier donne la vue
d'ensemble par phase du cahier des charges (`docs/cadrage/01-cahier-des-charges.pdf`, section 11).

Dernière mise à jour : 2 octobre 2026.

## Légende

- `[x]` fait, vérifié (tests, build) et commité
- `[ ]` à faire
- 🚧 en cours · ⏸️ bloqué (raison indiquée) · ❓ décision attendue d'APGO

## Fichiers par projet

| Fichier                        | Projet                                           |
| ------------------------------ | ------------------------------------------------ |
| [api.md](api.md)               | `apps/api` : API NestJS, base de données         |
| [admin.md](admin.md)           | `apps/admin` : administration et service client  |
| [web.md](web.md)               | `apps/web` : site public, apprenant et formateur |
| [mobile.md](mobile.md)         | `apps/mobile` : application Flutter              |
| [transverse.md](transverse.md) | Design, traductions, contenus, infra, CI         |
| [decisions.md](decisions.md)   | Questions ouvertes à trancher avec APGO          |

## Avancement par phase

| #   | Phase                    | État     | Détail                                                          |
| --- | ------------------------ | -------- | --------------------------------------------------------------- |
| 1   | Cadrage                  | ✅ fait  | Cahier des charges, architecture, maquettes, charte             |
| 2   | Fondations               | 🚧 cours | API (comptes, rôles, auth) faite ; admin, web, mobile à suivre  |
| 3   | Médiathèque et Bible     | à faire  | Catalogue, recherche, téléchargements, texte, audio, hors-ligne |
| 4   | Formation                | à faire  | Espace formateur, cours, progression, examen, certificat        |
| 5   | Service client et admin  | à faire  | Tickets, FAQ, tableau de bord, journal d'audit (écrans)         |
| 6   | Migration des ressources | à faire  | 1 To de vidéos, images, audios vers R2                          |
| 7   | Lancement                | à faire  | Certificats gratuits, suivi des statistiques                    |

## Ordre de travail retenu

1. API (fondations) — fait
2. Application admin : connexion avec double authentification, comptes, journal d'audit
3. Site web client : connexion, inscription, espace apprenant
4. Puis, domaine par domaine (médiathèque, Bible, formation…) : API → admin → web → mobile

## Historique

| Date       | Branche              | Réalisé                                                           |
| ---------- | -------------------- | ----------------------------------------------------------------- |
| 2026-10-02 | `design/accueil-web` | Maquettes, tokens, composants `libs/ui`, `libs/i18n`, accueil web |
| 2026-10-02 | `api/fondations`     | API : comptes, rôles, authentification, 2FA, audit, OpenAPI       |

## Mettre à jour ce suivi

À chaque tâche terminée : cocher la case dans le fichier du projet, ajuster l'état de la phase
ci-dessus si besoin et ajouter une ligne à l'historique, dans le même commit que le code.
