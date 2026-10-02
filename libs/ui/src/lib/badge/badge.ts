import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Pastille : `on-dark` (doré sur violet foncé, pour fond violet) ou `primary` (sur fond clair). */
@Component({
  selector: 'apgo-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
})
export class Badge {
  readonly tone = input<'on-dark' | 'primary'>('primary');
}
