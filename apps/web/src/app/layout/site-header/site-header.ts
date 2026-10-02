import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button, Icon, Logo } from '@apgo/ui';

@Component({
  selector: 'apgo-site-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslocoDirective,
    Button,
    Icon,
    Logo,
  ],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/bible', key: 'common.nav.bible' },
    { path: '/formations', key: 'common.nav.courses' },
    { path: '/mediatheque', key: 'common.nav.media' },
    { path: '/association', key: 'common.nav.association' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
