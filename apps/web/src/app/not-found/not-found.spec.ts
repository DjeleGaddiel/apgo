import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideApgoI18n } from '@apgo/i18n';
import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([]), provideApgoI18n()],
    }).compileComponents();
  });

  it('explique la situation et propose de revenir à l’accueil', async () => {
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toBe('Page introuvable');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
