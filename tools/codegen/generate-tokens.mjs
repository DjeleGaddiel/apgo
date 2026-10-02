// Génère les tokens de design pour Angular (SCSS) et Flutter (Dart)
// à partir de design/tokens/tokens.json. Ne pas modifier les fichiers générés à la main.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tokens = JSON.parse(
  readFileSync(join(root, 'design/tokens/tokens.json'), 'utf8'),
);
const header =
  'Fichier généré par tools/codegen/generate-tokens.mjs depuis design/tokens/tokens.json. Ne pas modifier.';

const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const write = (path, content) => {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log('Généré :', path);
};

// SCSS : variables CSS sur :root
const css = [`// ${header}`, ':root {'];
for (const [name, t] of Object.entries(tokens.color))
  css.push(`  --apgo-color-${kebab(name)}: ${t.value};`);
for (const [name, t] of Object.entries(tokens.font))
  css.push(
    `  --apgo-font-${kebab(name)}: '${t.value}', '${t.fallback}', ${t.fallback.includes('Serif') ? 'serif' : 'sans-serif'};`,
  );
for (const group of ['fontSize', 'spacing', 'radius'])
  for (const [name, t] of Object.entries(tokens[group]))
    css.push(`  --apgo-${kebab(group)}-${name}: ${t.value}px;`);
css.push('}', '');
write('libs/ui/src/styles/_tokens.scss', css.join('\n'));

// Dart : constantes pour Flutter
const dart = [
  `// ${header}`,
  "import 'package:flutter/painting.dart';",
  '',
  'abstract final class ApgoColors {',
];
for (const [name, t] of Object.entries(tokens.color)) {
  if (t.comment) dart.push(`  /// ${t.comment}`);
  dart.push(
    `  static const ${name} = Color(0xFF${t.value.slice(1).toUpperCase()});`,
  );
}
dart.push('}', '', 'abstract final class ApgoFonts {');
for (const [name, t] of Object.entries(tokens.font)) {
  dart.push(`  /// ${t.comment}`);
  dart.push(`  static const ${name} = '${t.value}';`);
  dart.push(`  static const ${name}Fallback = '${t.fallback}';`);
}
dart.push('}', '');
for (const [group, cls] of [
  ['fontSize', 'ApgoFontSizes'],
  ['spacing', 'ApgoSpacing'],
  ['radius', 'ApgoRadius'],
]) {
  dart.push(`abstract final class ${cls} {`);
  for (const [name, t] of Object.entries(tokens[group]))
    dart.push(`  static const double ${name} = ${t.value};`);
  dart.push('}', '');
}
write('packages/apgo_design/lib/apgo_tokens.dart', dart.join('\n'));
