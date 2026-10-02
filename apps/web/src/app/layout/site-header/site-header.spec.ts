import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideApgoI18n } from '@apgo/i18n';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideApgoI18n(),
      ],
    }).compileComponents();
  });

  it('affiche les liens de navigation traduits', async () => {
    const fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    const links = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a'),
    ].map((a) => a.textContent?.trim());
    expect(links).toEqual([
      'Bible',
      'Formations',
      'Médiathèque',
      "L'association",
    ]);
  });

  it('ouvre et ferme le menu sur téléphone', async () => {
    const fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const toggle = el.querySelector<HTMLButtonElement>('.menu-toggle');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');

    toggle?.click();
    await fixture.whenStable();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle?.getAttribute('aria-label')).toBe('Fermer le menu');
    expect(el.querySelector('#site-menu')?.classList).toContain('open');

    el.querySelector<HTMLAnchorElement>('nav a')?.click();
    await fixture.whenStable();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });
});
