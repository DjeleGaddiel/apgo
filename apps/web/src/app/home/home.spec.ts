import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { provideApgoI18n } from '@apgo/i18n';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideApgoI18n(),
        provideTranslocoScope('home'),
      ],
    }).compileComponents();
  });

  it('affiche un seul titre principal et le verset du jour', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')?.textContent).toContain('peuple gouro');
    expect(el.querySelector('apgo-verse-card cite')?.textContent).toBe(
      'Jean 1.5 · LSG 1910',
    );
  });

  it('présente les trois services avec leur lien', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    const links = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll(
        '.pillar-link',
      ),
    ].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/bible', '/formations', '/mediatheque']);
  });
});
