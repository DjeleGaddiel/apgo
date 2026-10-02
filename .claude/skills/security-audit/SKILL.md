---
name: security-audit
description: Audit de sécurité d'un module, d'une application ou de tout le projet APGO selon les règles du cahier des charges (authentification, permissions, entrées, fichiers, secrets, audit, paiement, dépendances).
argument-hint: [module ou dossier] (vide = tout le projet)
disable-model-invocation: true
---

# Audit de sécurité

Périmètre : `$ARGUMENTS` (vide = tout le projet). Grille de référence : skill `security`
(la charger en premier).

Pour ne contrôler que les modifications en cours d'une branche, la commande intégrée
`/security-review` suffit ; cet audit sert à passer un périmètre entier au crible.

## Étapes

1. **Cartographier** le périmètre : routes exposées (contrôleurs NestJS) avec leur
   permission, données manipulées, services externes appelés, fichiers reçus.
2. **Contrôler** chaque point de la grille `security` :
   - chaque route a une permission explicite ; les routes publiques sont voulues ;
   - contrôle de propriété dans les services (formateur, apprenant) ;
   - DTO validés, tailles maximales, aucune requête SQL concaténée ;
   - authentification : Argon2id, durée et rotation des jetons, cookies, limitation des
     tentatives, double authentification des admins ;
   - fichiers : liste blanche, taille, nom régénéré, liens signés ;
   - en-têtes, CORS, limitation du débit ;
   - journal d'audit sur toutes les actions d'administration ;
   - paiement : statut venant uniquement du prestataire, interrupteur réservé au super admin ;
   - aucune donnée sensible dans les réponses, journaux ou envois à Sentry.
3. **Secrets** : rechercher dans le dépôt et l'historique git des clés, mots de passe ou
   jetons (`git log -p`, motifs `KEY`, `SECRET`, `TOKEN`, `PASSWORD`) ; vérifier que `.env`
   n'est pas suivi et que `.env.example` ne contient aucune valeur réelle.
4. **Dépendances** : `npm audit --omit=dev` ; distinguer les failles qui touchent le code
   livré de celles des outils de développement.
5. **Rapport**, classé par gravité :

   | Gravité | Problème | Où (fichier:ligne) | Scénario d'attaque | Correction |
   | ------- | -------- | ------------------ | ------------------ | ---------- |

   Critique = accès à des données ou actions d'autrui sans autorisation, fuite de secret ;
   Élevée = contournement possible sous conditions ; Moyenne = protection manquante ;
   Faible = durcissement.

   Ne signaler que ce qui a été vérifié dans le code ; indiquer clairement ce qui n'a pas
   pu être contrôlé.

6. **Corriger** seulement sur demande ; une fuite de secret se signale immédiatement,
   avec la marche à suivre (révoquer puis remplacer la clé).
