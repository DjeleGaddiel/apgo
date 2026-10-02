# Maquettes APGO

Référence visuelle des écrans, à suivre lors de l'intégration dans `apps/web`, `apps/admin`
et `apps/mobile`. Ces fichiers ne sont pas chargés par l'application : ils servent de modèle.

Toile de design (pour les voir et les modifier) :
https://claude.ai/artifact/M34JQ5RmsppHAnrkU6XHUe

| Fichier               | Écran                                | Cible                     |
| --------------------- | ------------------------------------ | ------------------------- |
| `Main.dc.html`        | Accueil mobile                       | `apps/mobile`             |
| `Bible.dc.html`       | Lecture de la Bible (texte et audio) | `apps/mobile`, `apps/web` |
| `Formation.dc.html`   | Détail d'une formation et ses leçons | `apps/mobile`, `apps/web` |
| `Mediatheque.dc.html` | Médiathèque                          | `apps/mobile`, `apps/web` |
| `Certificat.dc.html`  | Certificat de réussite (A4 paysage)  | `apps/api` (PDF)          |
| `Web.dc.html`         | Page d'accueil du site public        | `apps/web`                |
| `Admin.dc.html`       | Tableau de bord de l'administration  | `apps/admin`              |

## En intégrant un écran

- Les couleurs écrites en dur dans les maquettes correspondent aux tokens de
  `design/tokens/tokens.json` : dans le code, utiliser uniquement les variables `--apgo-*`
  (web) ou `ApgoColors` (Flutter).
- Les textes entre crochets (`[Titre de la formation]`) sont des emplacements : ils
  viennent de l'API ou des fichiers de traduction.
- Le texte biblique gouro n'apparaît pas dans les maquettes : il provient uniquement des
  fichiers officiels de l'Alliance Biblique de Côte d'Ivoire.
- Une maquette modifiée sur la toile doit être recopiée ici.
