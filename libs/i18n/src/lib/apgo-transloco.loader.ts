import { inject, Injectable, PendingTasks } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

type JsonModule = { default: Translation };

// Un fichier par langue et par domaine (`<langue>/<domaine>.json`). Le domaine `common`
// est chargé au démarrage ; les autres sont des scopes Transloco chargés avec leur route.
// Pour ajouter le gouro : créer `goa/<domaine>.json` et une entrée par fichier ici.
const files: Record<string, () => Promise<JsonModule>> = {
  fr: () => import('./fr/common.json'),
  'home/fr': () => import('./fr/home.json'),
};

@Injectable({ providedIn: 'root' })
export class ApgoTranslocoLoader implements TranslocoLoader {
  // Signale le chargement à Angular pour que le rendu serveur attende les textes.
  private readonly pendingTasks = inject(PendingTasks);

  getTranslation(path: string): Promise<Translation> {
    const load = files[path];
    if (!load) {
      return Promise.reject(new Error(`Traductions introuvables : ${path}`));
    }
    const done = this.pendingTasks.add();
    return load()
      .then((m) => m.default)
      .finally(done);
  }
}
