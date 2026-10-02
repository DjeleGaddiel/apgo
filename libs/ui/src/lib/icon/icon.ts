import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'home'
  | 'book'
  | 'graduation'
  | 'media'
  | 'user'
  | 'bell'
  | 'search'
  | 'download'
  | 'play'
  | 'check'
  | 'chevron-left'
  | 'chevron-down'
  | 'menu'
  | 'close';

/**
 * Icône décorative (masquée aux lecteurs d'écran). Un bouton qui ne contient qu'une icône
 * doit porter un `aria-label`.
 */
@Component({
  selector: 'apgo-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
}
