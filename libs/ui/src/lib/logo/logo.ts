import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Logo provisoire (monogramme et nom), à remplacer par le logo officiel de l'APGO.
 * `tone` : `light` sur fond clair, `dark` sur fond violet.
 */
@Component({
  selector: 'apgo-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
})
export class Logo {
  readonly tone = input<'light' | 'dark'>('light');
}
