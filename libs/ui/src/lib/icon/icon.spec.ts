import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

@Component({
  imports: [Icon],
  template: `<apgo-icon name="book" [size]="32" />`,
})
class Host {}

describe('Icon', () => {
  it('dessine l’icône demandée, masquée aux lecteurs d’écran', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const icon: HTMLElement = fixture.nativeElement.querySelector('apgo-icon');
    const svg = icon.querySelector('svg');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.querySelectorAll('path').length).toBe(2);
  });
});
