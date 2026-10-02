import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'inverse';

/**
 * Style de bouton appliqué à un vrai `<button>` ou à un lien `<a>`.
 * - `primary` : l'action principale de l'écran (une seule par écran).
 * - `secondary` : actions secondaires sur fond clair.
 * - `accent` (doré) et `inverse` (contour blanc) : sur fond violet uniquement.
 */
@Component({
  // Sélecteur d'attribut voulu : l'élément reste un vrai <button> ou <a> (clavier, lecteurs d'écran).
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[apgoButton], a[apgoButton]',
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<'md' | 'lg'>('md');
}
