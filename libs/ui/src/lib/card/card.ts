import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardTone = 'light' | 'white' | 'dark';

/** Conteneur arrondi : `light` (violet très clair), `white` (bordure), `dark` (violet foncé). */
@Component({
  selector: 'apgo-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
})
export class Card {
  readonly tone = input<CardTone>('light');
}
