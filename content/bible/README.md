# Bible

Sources texte de la Bible, au format **USFM**, un dossier par version et un fichier par livre.

| Dossier       | Version                                             | État                                                            |
| ------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `gouro-1979/` | Bible en gouro, « Kazambale lé Sebe Sauunu » (1979) | En attente des fichiers de l'Alliance Biblique de Côte d'Ivoire |
| `lsg-1910/`   | Louis Segond 1910 (français, domaine public)        | Version de développement et de test                             |

Les fichiers audio (un par chapitre, nommés `LIVRE_CCC.mp3`, par exemple `MRK_001.mp3`)
ne sont **pas** dans le dépôt : ils sont stockés sur Cloudflare R2.
Chaque version peut avoir un fichier `audio.json` qui liste les chapitres disponibles.

L'import dans la base, la recherche et les paquets hors-ligne se fait avec le skill `bible-import`.

Droits : le texte gouro est la propriété de l'Alliance Biblique de Côte d'Ivoire.
Ne jamais ajouter de texte copié depuis YouVersion ou un autre site.
