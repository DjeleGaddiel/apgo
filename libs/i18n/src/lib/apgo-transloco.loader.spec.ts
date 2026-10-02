import { TestBed } from '@angular/core/testing';
import { ApgoTranslocoLoader } from './apgo-transloco.loader';

describe('ApgoTranslocoLoader', () => {
  let loader: ApgoTranslocoLoader;

  beforeEach(() => {
    loader = TestBed.inject(ApgoTranslocoLoader);
  });

  it('charge les textes communs de la langue', async () => {
    const translation = await loader.getTranslation('fr');
    expect(translation['common']).toBeDefined();
  });

  it('charge un domaine à la demande', async () => {
    const translation = await loader.getTranslation('home/fr');
    expect(translation['hero']).toBeDefined();
  });

  it('refuse un fichier inconnu', async () => {
    await expect(loader.getTranslation('goa')).rejects.toThrow('goa');
  });
});
