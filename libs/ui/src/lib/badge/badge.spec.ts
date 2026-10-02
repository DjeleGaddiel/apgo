import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';

@Component({
  imports: [Badge],
  template: `<apgo-badge tone="on-dark">Avec certificat</apgo-badge>`,
})
class Host {}

describe('Badge', () => {
  it('affiche son libellé avec le ton demandé', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const badge: HTMLElement =
      fixture.nativeElement.querySelector('apgo-badge');
    expect(badge.dataset['tone']).toBe('on-dark');
    expect(badge.textContent).toBe('Avec certificat');
  });
});
