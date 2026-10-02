import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `<button apgoButton variant="accent" size="lg">Lire</button>`,
})
class Host {}

describe('Button', () => {
  it('applique la variante et la taille au bouton natif', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.dataset['variant']).toBe('accent');
    expect(button.dataset['size']).toBe('lg');
    expect(button.textContent).toBe('Lire');
  });
});
