import { EnvironmentProviders, isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { ApgoTranslocoLoader } from './apgo-transloco.loader';

/** Langues de l'interface : le français au lancement, le gouro (`goa`) ensuite. */
export const APGO_LANGS = ['fr'] as const;

export function provideApgoI18n(): EnvironmentProviders[] {
  return provideTransloco({
    config: {
      availableLangs: [...APGO_LANGS],
      defaultLang: 'fr',
      fallbackLang: 'fr',
      missingHandler: { useFallbackTranslation: true },
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: ApgoTranslocoLoader,
  });
}
