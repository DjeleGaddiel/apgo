---
name: ui-ux
description: Règles d'interface et d'expérience utilisateur APGO (mobile d'abord, états de chargement/vide/erreur/hors-ligne, accessibilité WCAG AA, tokens de design, pages légères pour connexions lentes). À appliquer chaque fois qu'on crée ou modifie un écran, un composant visuel ou un style, sur le web (Angular) comme sur le mobile (Flutter).
---

# Règles UI/UX APGO

Public : majoritairement sur téléphone, connexions lentes ou coûteuses, plusieurs pays,
niveaux de familiarité avec le numérique très variés. Chaque écran doit rester simple,
lisible et utilisable avec une mauvaise connexion.

## 1. Mobile d'abord

- Concevoir pour un écran de **360 px** de large, puis élargir (points de rupture à 768 px
  et 1024 px). Aucun défilement horizontal.
- Zones cliquables d'au moins **44 × 44 px**, espacées.
- Actions principales en bas d'écran ou bien visibles sans défiler.
- Une seule action principale par écran (bouton violet plein) ; les autres en secondaire.

## 2. Les quatre états obligatoires

Tout écran ou composant qui charge des données affiche :

| État       | Attendu                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Chargement | Squelette ou indicateur ; pas d'écran blanc. Au-delà de 10 s, un message rassurant                   |
| Vide       | Une phrase qui explique et, si possible, une action (« Aucune formation suivie. Voir le catalogue ») |
| Erreur     | Message compréhensible + bouton « Réessayer » (voir le skill `error-handling`)                       |
| Hors-ligne | Contenu en cache s'il existe, sinon message clair ; jamais d'erreur technique                        |

## 3. Identité visuelle

- Couleurs et polices **uniquement** via les tokens : variables `--apgo-*` (web),
  `ApgoColors` / `ApgoFonts` / `ApgoSpacing` (Flutter). Jamais de valeur en dur.
- Dosage visé : environ 60 % blanc, 30 % violet, 10 % jaune doré.
- Doré réservé aux mises en valeur ponctuelles (certificats, badges). **Jamais de texte
  doré sur fond blanc** ; doré sur violet foncé pour titres et icônes ; texte violet foncé
  sur bouton doré.
- Rouge, vert, orange : uniquement pour les messages système.
- Polices : Poppins (titres, boutons), Inter (interface), Source Serif 4 (Bible, textes
  longs, certificat). Toute police doit afficher correctement l'alphabet gouro.

## 4. Accessibilité (WCAG AA)

- Contraste d'au moins 4,5:1 pour le texte, 3:1 pour les grands titres et les icônes.
- Texte de **16 px minimum** ; la lecture de la Bible permet d'agrandir le texte.
- Web : HTML sémantique (`button`, `nav`, `main`, titres hiérarchisés), `alt` sur les
  images informatives, `label` sur chaque champ, navigation au clavier, focus visible.
- Flutter : `Semantics` sur les éléments sans texte, tailles de texte qui suivent les
  réglages du téléphone.
- Ne jamais transmettre une information par la couleur seule.

## 5. Pages légères

- Images : WebP, dimensions adaptées (`srcset` / `NgOptimizedImage` côté web), chargement
  différé hors de l'écran visible.
- Routes chargées à la demande ; pas de bibliothèque lourde pour un besoin simple.
- Vidéos : jamais en lecture automatique ; proposer la version allégée.
- Avant tout téléchargement volumineux, afficher la taille.

## 6. Formulaires

- Libellé au-dessus du champ (pas seulement un texte d'exemple qui disparaît).
- Validation à la sortie du champ et à l'envoi, message d'erreur sous le champ concerné,
  en français simple (« Le numéro doit contenir 10 chiffres »).
- Bouton d'envoi désactivé pendant l'envoi, avec indicateur ; jamais de double envoi.
- Conserver la saisie en cas d'erreur réseau.

## 7. Textes

- Phrases courtes, vocabulaire courant, tutoiement exclu (vouvoiement).
- Aucun texte en dur dans le code : voir le skill `i18n`.
