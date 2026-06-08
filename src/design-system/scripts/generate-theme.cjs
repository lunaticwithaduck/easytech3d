/**
 * Reads tokens.ts (colors, radius) + typography.ts (fontSize) and generates theme.css
 * as Tailwind v4 `@theme` custom properties.
 *
 *   node src/design-system/scripts/generate-theme.cjs           # generate once
 *   node src/design-system/scripts/generate-theme.cjs --watch   # regenerate on change
 *
 * Extended vs. the majstorbg original: also emits `--text-*` from typography.fontSize so the
 * size scale is token-driven (the original only emitted colors + radius).
 */

const { readFileSync, writeFileSync, watch } = require('node:fs');
const { resolve } = require('node:path');

const DS = resolve(__dirname, '..');
const TOKENS_PATH = resolve(DS, 'tokens.ts');
const TYPOGRAPHY_PATH = resolve(DS, 'typography.ts');
const OUTPUT_PATH = resolve(DS, 'theme.css');

function parseExport(src, name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*\\{([\\s\\S]*?)\\}\\s*as const`);
  const match = src.match(re);
  if (!match) throw new Error(`Could not find ${name} export`);
  const entries = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/["']?([\w-]+)["']?\s*:\s*(?:"([^"]+?)"|'([^']+?)')/);
    if (m) entries[m[1]] = m[2] ?? m[3];
  }
  return entries;
}

function block(vars, prefix) {
  return Object.entries(vars)
    .map(([key, value]) => `\t--${prefix}-${key}: ${value};`)
    .join('\n');
}

function generate() {
  const tokensSrc = readFileSync(TOKENS_PATH, 'utf-8');
  const typoSrc = readFileSync(TYPOGRAPHY_PATH, 'utf-8');
  const colors = parseExport(tokensSrc, 'colors');
  const radius = parseExport(tokensSrc, 'radius');
  const fontSize = parseExport(typoSrc, 'fontSize');

  const css = `/* AUTO-GENERATED — do not edit. Source: src/design-system/{tokens,typography}.ts */
/* Run "pnpm theme:generate" to regenerate. */

@theme {
${block(colors, 'color')}

${block(radius, 'radius')}

${block(fontSize, 'text')}
}
`;
  writeFileSync(OUTPUT_PATH, css);
  console.log(
    `[generate-theme] wrote theme.css (${Object.keys(colors).length} colors, ${Object.keys(radius).length} radii, ${Object.keys(fontSize).length} sizes)`,
  );
}

generate();

if (process.argv.includes('--watch')) {
  console.log('[generate-theme] watching tokens.ts + typography.ts');
  for (const p of [TOKENS_PATH, TYPOGRAPHY_PATH]) {
    watch(p, (event) => {
      if (event === 'change') generate();
    });
  }
}
