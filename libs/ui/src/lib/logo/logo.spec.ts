import { TestBed } from '@angular/core/testing';
import { Logo } from './logo';

describe('Logo', () => {
  it('affiche le nom et masque le monogramme aux lecteurs d’écran', async () => {
    const fixture = TestBed.createComponent(Logo);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.name')?.textContent).toBe('APGO');
    expect(el.querySelector('.mark')?.getAttribute('aria-hidden')).toBe('true');
  });
});
