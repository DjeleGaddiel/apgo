import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideApgoI18n } from '@apgo/i18n';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideApgoI18n()],
    }).compileComponents();
  });

  it('affiche l’en-tête, le contenu et le pied de page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('apgo-site-header')).toBeTruthy();
    expect(el.querySelector('main#contenu')).toBeTruthy();
    expect(el.querySelector('apgo-site-footer')).toBeTruthy();
    expect(el.querySelector('.skip-link')?.textContent?.trim()).toBe(
      'Aller au contenu',
    );
  });
});
