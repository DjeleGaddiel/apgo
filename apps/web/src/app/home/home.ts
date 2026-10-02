import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Badge, Button, Card, Icon, IconName, VerseCard } from '@apgo/ui';

interface Pillar {
  key: 'bible' | 'courses' | 'media';
  icon: IconName;
  path: string;
}

@Component({
  selector: 'apgo-home',
  imports: [
    RouterLink,
    TranslocoDirective,
    Badge,
    Button,
    Card,
    Icon,
    VerseCard,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly pillars: Pillar[] = [
    { key: 'bible', icon: 'book', path: '/bible' },
    { key: 'courses', icon: 'graduation', path: '/formations' },
    { key: 'media', icon: 'media', path: '/mediatheque' },
  ];
}
