import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Barre de progression accessible ; `value` en pourcentage (0 à 100). */
@Component({
  selector: 'apgo-progress-bar',
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-label]': 'label()',
    '[attr.data-tone]': 'tone()',
  },
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly tone = input<'primary' | 'accent'>('primary');

  protected readonly percent = computed(() =>
    Math.round(Math.min(100, Math.max(0, this.value()))),
  );
}
