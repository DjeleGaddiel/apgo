import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Logo } from '@apgo/ui';

@Component({
  selector: 'apgo-site-footer',
  imports: [RouterLink, TranslocoDirective, Logo],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly links = [
    { path: '/association', key: 'common.footer.association' },
    { path: '/contact', key: 'common.footer.contact' },
    { path: '/aide', key: 'common.footer.help' },
    { path: '/confidentialite', key: 'common.footer.privacy' },
  ];
}
