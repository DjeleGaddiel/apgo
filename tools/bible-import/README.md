# bible-import

Script d'import d'une version de la Bible depuis `content/bible/<version>/` (USFM) :

1. remplit PostgreSQL (livres, chapitres, versets) ;
2. indexe les versets dans Meilisearch ;
3. génère un paquet hors-ligne par livre (SQLite compressé) et l'envoie sur R2.

À implémenter avec le module `bible` de l'API (étape « Médiathèque et Bible » du planning).
