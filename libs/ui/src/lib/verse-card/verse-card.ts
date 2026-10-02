import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Carte « verset du jour » sur violet foncé ; une action peut être projetée à côté de la référence. */
@Component({
  selector: 'apgo-verse-card',
  templateUrl: './verse-card.html',
  styleUrl: './verse-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerseCard {
  readonly label = input.required<string>();
  readonly text = input.required<string>();
  readonly reference = input.required<string>();
}
