import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VerseCard } from './verse-card';

@Component({
  imports: [VerseCard],
  template: `
    <apgo-verse-card
      label="Verset du jour"
      text="Elle était au commencement avec Dieu."
      reference="Jean 1.2"
    >
      <a href="/bible">Lire</a>
    </apgo-verse-card>
  `,
})
class Host {}

describe('VerseCard', () => {
  it('affiche le verset, sa référence et l’action projetée', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('figcaption')?.textContent).toBe('Verset du jour');
    expect(el.querySelector('blockquote')?.textContent).toContain(
      'Elle était au commencement avec Dieu.',
    );
    expect(el.querySelector('cite')?.textContent).toBe('Jean 1.2');
    expect(el.querySelector('a')?.textContent).toBe('Lire');
  });
});
