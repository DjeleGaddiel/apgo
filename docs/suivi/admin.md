# Administration (`apps/admin`)

Angular, port 4300, jamais servie au public. Écrans selon le skill `new-entity` ;
référence visuelle : `design/maquettes/Admin.dc.html`.

## Prochaine étape 🚧

- [ ] Client TypeScript généré depuis l'OpenAPI (`libs/api-client`, skill `sync-api`) — vérifier Java
- [ ] Mise en page : menu latéral, en-tête, styles `libs/ui`, traductions `libs/i18n`
- [ ] Intercepteur HTTP : cookies, renouvellement de session, erreurs traduites par `code`
- [ ] Connexion : email et mot de passe
- [ ] Double authentification : configuration (QR code) et saisie du code
- [ ] Garde de route : accès réservé à `admin.access`, menu adapté aux permissions
- [ ] Déconnexion

## Comptes (phase 2)

- [ ] Liste des comptes : filtres état, rôle, recherche, pagination
- [ ] Fiche d'un compte
- [ ] Formateurs en attente : valider
- [ ] Suspendre, réactiver, supprimer, avec confirmation
- [ ] Les quatre états sur chaque écran : chargement, vide, erreur, hors-ligne

## Journal d'audit (phase 2)

- [ ] Liste filtrable (auteur, action, cible), du plus récent au plus ancien

## Tableau de bord (phase 5)

- [ ] Indicateurs : visiteurs, téléchargements, comptes, formations suivies, certificats
- [ ] Demandes ouvertes du service client, contenus à valider

## Contenus (phases 3 et 4)

- [ ] Médiathèque : ajouter, modifier, supprimer un contenu, envoi des fichiers
- [ ] Bible : versions, import, audios
- [ ] Formations : supervision

## Service client (phase 5)

- [ ] Tickets : liste, détail, réponse, statut
- [ ] FAQ : gestion des questions
- [ ] Paiements : consultation des statuts
- [ ] Certificats : renvoyer, régénérer

## Paramètres

- [ ] Prix du certificat et offre de lancement (date de fin)
- [ ] Interrupteur du paiement réel (super admin seulement)
- [ ] Gestion des rôles et permissions (super admin)
- [ ] Comptes de l'équipe d'administration
