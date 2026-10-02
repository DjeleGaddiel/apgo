import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideApgoI18n } from '@apgo/i18n';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([]), provideApgoI18n()],
    }).compileComponents();
  });

  it('affiche les liens utiles et la mention des droits bibliques', async () => {
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('nav a').length).toBe(4);
    expect(el.querySelector('.rights')?.textContent).toContain(
      "Alliance Biblique de Côte d'Ivoire",
    );
  });
});
