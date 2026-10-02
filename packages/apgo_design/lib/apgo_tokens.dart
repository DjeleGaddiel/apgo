// Fichier généré par tools/codegen/generate-tokens.mjs depuis design/tokens/tokens.json. Ne pas modifier.
import 'package:flutter/painting.dart';

abstract final class ApgoColors {
  /// Violet : en-têtes, boutons principaux, liens, navigation
  static const primary = Color(0xFF5B2A86);
  /// Violet foncé : pied de page, texte, survol des boutons
  static const primaryDark = Color(0xFF3E1B5E);
  /// Violet très clair : fonds alternés, cartes, sélections
  static const primaryLight = Color(0xFFF4EEFA);
  /// Jaune doré : certificats, badges, appels à l'action secondaires. Jamais de texte doré sur fond blanc
  static const accent = Color(0xFFD4A017);
  /// Blanc : fonds de page, cartes, zones de lecture
  static const background = Color(0xFFFFFFFF);
  /// Fond de l'administration, derrière les cartes blanches
  static const surface = Color(0xFFFAF7FD);
  /// Texte et icônes posés sur le violet ou le violet foncé
  static const onPrimary = Color(0xFFFFFFFF);
  /// Texte courant
  static const text = Color(0xFF3E1B5E);
  /// Texte secondaire : dates, durées, onglets inactifs (contraste 5,9:1 sur blanc)
  static const textMuted = Color(0xFF6B5A7B);
  /// Séparateurs et bordures de cartes
  static const border = Color(0xFFE6DCF0);
  /// Bordures de champs et de boutons secondaires (contraste 3,9:1 sur blanc, minimum WCAG 3:1)
  static const borderStrong = Color(0xFF8C78A1);
  /// Messages système uniquement
  static const success = Color(0xFF2E7D32);
  /// Messages système uniquement
  static const warning = Color(0xFFED6C02);
  /// Messages système uniquement
  static const error = Color(0xFFC62828);
}

abstract final class ApgoFonts {
  /// Titres et boutons
  static const heading = 'Poppins';
  static const headingFallback = 'Noto Sans';
  /// Interface et texte courant
  static const body = 'Inter';
  static const bodyFallback = 'Noto Sans';
  /// Bible, textes longs, certificat
  static const reading = 'Source Serif 4';
  static const readingFallback = 'Noto Serif';
}

abstract final class ApgoFontSizes {
  static const double base = 16;
  static const double sm = 14;
  static const double lg = 18;
  static const double xl = 22;
  static const double xxl = 28;
}

abstract final class ApgoSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
}

abstract final class ApgoRadius {
  static const double sm = 4;
  static const double md = 8;
  static const double lg = 16;
}
