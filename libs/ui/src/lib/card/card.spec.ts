import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Card } from './card';

@Component({
  imports: [Card],
  template: `<apgo-card tone="dark"><p>Contenu</p></apgo-card>`,
})
class Host {}

describe('Card', () => {
  it('projette son contenu avec le ton demandé', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const card: HTMLElement = fixture.nativeElement.querySelector('apgo-card');
    expect(card.dataset['tone']).toBe('dark');
    expect(card.textContent).toContain('Contenu');
  });
});
