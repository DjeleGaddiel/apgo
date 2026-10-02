# Application mobile (`apps/mobile`)

Flutter, organisée par fonctionnalité (`lib/features/`). Maquettes : `Main.dc.html`,
`Bible.dc.html`, `Formation.dc.html`, `Mediatheque.dc.html` dans `design/maquettes/`.

## Socle (phase 2)

- [x] Tokens de design générés (`packages/apgo_design`)
- [ ] Installer Flutter sur le poste de développement et dans la CI
- [ ] Client Dart généré depuis l'OpenAPI (`packages/apgo_api`, skill `sync-api`)
- [ ] Thème (couleurs, polices Poppins, Inter, Source Serif 4)
- [ ] Traductions ARB (`app_fr.arb`, puis `app_goa.arb`)
- [ ] Navigation par onglets : Accueil, Bible, Formations, Médias, Compte
- [ ] Gestion des erreurs : pas de connexion / erreur du serveur, Sentry

## Comptes (phase 2)

- [ ] Inscription, connexion (jetons dans `flutter_secure_storage`)
- [ ] Renouvellement automatique de la session, déconnexion
- [ ] Mon compte

## Accueil

- [ ] Verset du jour, formation en cours, nouveautés (maquette `Main.dc.html`)

## Bible (phase 3)

- [ ] Lecture, choix de la version, taille du texte
- [ ] Audio par chapitre, lecture continue
- [ ] Téléchargement par livre avec la taille affichée, lecture hors-ligne
- [ ] Dernière position de lecture

## Médiathèque (phase 3)

- [ ] Catalogue, recherche, filtres
- [ ] Téléchargement pour lecture hors-ligne, taille affichée avant

## Formations (phase 4)

- [ ] Catalogue, fiche, leçons, progression
- [ ] Examen et certificat

## Publication

- [ ] Notifications Firebase
- [ ] Publication Google Play et App Store
