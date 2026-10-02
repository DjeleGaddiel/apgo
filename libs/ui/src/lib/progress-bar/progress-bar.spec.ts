import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressBar } from './progress-bar';

@Component({
  imports: [ProgressBar],
  template: `<apgo-progress-bar [value]="value()" label="Progression" />`,
})
class Host {
  readonly value = signal(37.4);
}

describe('ProgressBar', () => {
  it('expose la valeur arrondie aux technologies d’assistance', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const bar: HTMLElement =
      fixture.nativeElement.querySelector('apgo-progress-bar');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('37');
    expect(bar.getAttribute('aria-label')).toBe('Progression');
  });

  it('borne la valeur entre 0 et 100', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.value.set(140);
    await fixture.whenStable();
    const bar: HTMLElement =
      fixture.nativeElement.querySelector('apgo-progress-bar');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
  });
});
