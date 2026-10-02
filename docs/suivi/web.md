# Site web (`apps/web`)

Angular avec rendu serveur : site public, espace apprenant et espace formateur.
Référence visuelle : `design/maquettes/Web.dc.html` et les écrans mobiles pour les parcours.

## Fait

- [x] En-tête avec menu repliable sur téléphone, pied de page, lien d'évitement
- [x] Page d'accueil (bandeau, verset du jour, trois services, application mobile)
- [x] Page introuvable (404 côté serveur)
- [x] Textes via Transloco (`libs/i18n`), rendus côté serveur
- [x] Vérifié à 360 px et 1280 px, sans défilement horizontal

## Comptes (phase 2)

- [ ] Client API généré, intercepteur (cookies, renouvellement, erreurs traduites)
- [ ] Inscription apprenant
- [ ] Demande de compte formateur, message « en attente de validation »
- [ ] Connexion, déconnexion
- [ ] Mot de passe oublié
- [ ] Mon compte : profil, mot de passe, langue

## Médiathèque (phase 3)

- [ ] Catalogue, recherche, filtres (maquette `Mediatheque.dc.html`)
- [ ] Fiche d'un contenu, lecture vidéo et audio, téléchargement avec taille affichée
- [ ] URL référencées par Google, une par contenu

## Bible (phase 3)

- [ ] Lecture par livre et chapitre, une URL par chapitre (maquette `Bible.dc.html`)
- [ ] Choix de la version (LSG 1910, gouro), taille du texte réglable
- [ ] Recherche par mot, lien direct vers un verset
- [ ] Audio par chapitre, lecture continue
- [ ] Dernière position de lecture (avec compte)

## Formations (phase 4)

- [ ] Catalogue public, « Formations à la une » sur l'accueil
- [ ] Fiche d'une formation, leçons (maquette `Formation.dc.html`)
- [ ] Progression sauvegardée, historique
- [ ] Examen QCM, résultat, certificat à télécharger
- [ ] Page publique de vérification d'un certificat

## Espace formateur (phase 4)

- [ ] Mes formations : créer, modifier, publier
- [ ] Modules et leçons : vidéo, texte, documents
- [ ] Banque de questions et réglages de l'examen
- [ ] Suivi de mes élèves

## Service client (phase 5)

- [ ] Formulaire de contact, FAQ
- [ ] Mes demandes (tickets)
- [ ] Bouton WhatsApp vers le numéro officiel

## Qualité

- [ ] Titres de page et descriptions traduits par route
- [ ] Polices auto-hébergées en WOFF2 (latin étendu) au lieu de Google Fonts
- [ ] Choix de langue quand le gouro sera disponible
- [ ] Audit `/ux-review` de chaque écran
