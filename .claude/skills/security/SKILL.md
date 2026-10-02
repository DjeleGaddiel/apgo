---
name: security
description: Règles de sécurité APGO (authentification, permissions côté serveur, validation des entrées, fichiers, secrets, journal d'audit, paiement). À appliquer chaque fois qu'on écrit ou modifie du code d'API, d'authentification, de gestion de comptes, d'envoi de fichiers, de paiement ou de configuration serveur.
---

# Règles de sécurité APGO

Référence : section 7 du cahier des charges (`docs/cadrage/01-cahier-des-charges.pdf`).
Ces règles sont obligatoires dès la phase 1. En cas de doute entre simplicité et sécurité,
choisir la sécurité et le signaler.

## Comptes et authentification

- Mots de passe hachés avec **Argon2id** ; jamais de mot de passe en clair, dans les
  journaux ou dans une réponse.
- Jeton d'accès de courte durée (15 min) + jeton de renouvellement stocké haché en base,
  révocable, renouvelé à chaque usage (rotation). Déconnexion = révocation.
- Web : jetons dans des cookies `HttpOnly`, `Secure`, `SameSite=Lax` ; jamais dans
  `localStorage`. Mobile : stockage sécurisé du téléphone (`flutter_secure_storage`).
- Limitation des tentatives de connexion par compte et par adresse IP.
- **Double authentification obligatoire** pour le super administrateur et l'administrateur APGO.
- Messages de connexion neutres (« Identifiants incorrects »), sans dire si le compte existe.

## Permissions

- Vérifiées **côté serveur à chaque requête**, jamais seulement dans l'interface.
- Refus par défaut : une route sans déclaration de permission ne doit pas être accessible.
- Contrôle de propriété dans le service : un formateur ne lit et ne modifie que ses cours
  et ses élèves ; un apprenant que ses propres résultats.
- Identifiants non devinables (UUID) pour les ressources exposées.

## Entrées

- Validation stricte de chaque donnée reçue (DTO `class-validator`, `whitelist` et
  `forbidNonWhitelisted`) ; taille maximale sur chaque texte et chaque liste.
- Requêtes uniquement via Prisma ; si `$queryRaw` est inévitable, paramètres liés,
  jamais de concaténation.
- Côté Angular, ne jamais contourner l'assainissement (`bypassSecurityTrust*`) sans
  justification écrite en commentaire.

## Fichiers

- Types autorisés par liste blanche (vérifier le contenu réel, pas seulement l'extension)
  et taille maximale par type.
- Nom de fichier régénéré côté serveur ; le nom d'origine n'est conservé qu'en métadonnée.
- Fichiers envoyés directement vers R2, jamais exécutés ni servis par le serveur de l'API.
- Téléchargements par **liens signés à durée limitée**.

## Réseau et serveur

- En-têtes de sécurité (`helmet`), CORS limité aux domaines APGO, limitation du débit
  global et renforcée sur les routes sensibles (connexion, inscription, contact).
- Secrets uniquement dans les variables d'environnement ; mettre à jour `.env.example`
  (sans valeur réelle) quand une variable est ajoutée. Jamais de secret dans le code,
  les tests, les journaux ou un commit.

## Journal d'audit

Chaque action d'un administrateur est enregistrée (qui, quoi, sur quoi, quand, depuis
quelle adresse) : validation, suspension et suppression de comptes, changement de rôle,
modification de contenu, changement de prix, régénération de certificat, interrupteur
de paiement. Le journal n'est jamais modifiable ni supprimable depuis l'application.

## Paiement et certificats

- Le passage de la simulation au paiement réel est réservé au super administrateur et
  journalisé.
- Le statut d'un paiement n'est jamais pris depuis le client : uniquement depuis le
  prestataire (notification vérifiée par signature).
- Certificat : numéro unique non devinable ; la page publique de vérification n'affiche
  que le nom, la formation, la date et la validité.

## Données personnelles

Ne collecter que le nécessaire. Ne jamais journaliser mot de passe, jeton, numéro de
téléphone complet ou données de paiement.
