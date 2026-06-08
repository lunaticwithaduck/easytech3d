#!/usr/bin/env node
/**
 * Convention linter — enforces the design-system discipline in CLAUDE.md.
 *
 * Run: node scripts/lint-conventions.cjs   (pnpm lint:conventions)
 * Exits 1 if any rule is violated.
 *
 * Scope: src/app/** and src/features/**. Design PRIMITIVES live in src/design-system/** and
 * are NOT scanned — they're allowed raw HTML + next/link + next/font, that's their job.
 *
 * Ported from majstorbg's apps/web/scripts/lint-conventions.cjs and repointed at this repo.
 */

const { readFileSync, readdirSync, statSync } = require('node:fs');
const { join, relative, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');

const SCAN_DIRS = [resolve(ROOT, 'src/app'), resolve(ROOT, 'src/features')];

const ALLOW_IMPORTS_NEXT_LINK = new Set();
const ALLOW_IMPORTS_NEXT_FONT = new Set([resolve(ROOT, 'src/app/fonts.ts')]);

// File paths where raw HTML (<html>/<body> aside) is allowed — the shell layouts.
const ALLOW_RAW_HTML = new Set([
  resolve(ROOT, 'src/app/layout.tsx'),
  resolve(ROOT, 'src/app/[locale]/layout.tsx'),
]);

// Never-matching regex kept so skipFile checks stay structurally identical to the source.
const ALLOW_RAW_PRIMITIVE_HTML_RE = /^$a/;

const IS_TEST_OR_STORY = (p) => /\.(test|spec|stories)\.(tsx?|jsx?)$/.test(p);

// R3 — <Text> static copy must flow through `value=`. We flag a <Text>…</Text> with children
// that look like static copy and no `value=`/`asChild`. Pure-runtime children are allowed.
const TEXT_OPEN_TAG_RE = /<Text\b([^>]*?)>([\s\S]*?)<\/Text>/g;

// R5 — one component per file.
const TOP_LEVEL_COMPONENT_RE =
  /^(?:export\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)\s*(?:\(|=\s*(?:\(|\(?\s*[A-Za-z{]))/gm;

function findComponentDeclarations(src) {
  const matches = [...src.matchAll(TOP_LEVEL_COMPONENT_RE)];
  const decls = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const name = match[1];
    const start = match.index ?? 0;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? src.length) : src.length;
    const body = src.slice(start, end);
    if (
      /return\s*\(\s*</.test(body) ||
      /=>\s*\(?\s*</.test(body) ||
      /<[A-Z][A-Za-z0-9]*[\s/>]/.test(body)
    ) {
      const line = src.slice(0, start).split('\n').length;
      decls.push({ name, line });
    }
  }
  return decls;
}

function findMultiComponentViolations(src, rel, file) {
  if (ALLOW_RAW_PRIMITIVE_HTML_RE.test(file) || IS_TEST_OR_STORY(file)) return [];
  if (!file.endsWith('.tsx')) return [];
  const decls = findComponentDeclarations(src);
  if (decls.length < 2) return [];
  return decls.slice(1).map((decl) => ({
    file: rel,
    line: decl.line,
    rule: 'R5: one component per file',
    hint: `File declares multiple React components (${decls.map((d) => d.name).join(', ')}). Extract "${decl.name}" to its own ./components/${decl.name}/${decl.name}.tsx. Non-component helpers belong in ./utils/<name>.utils.ts.`,
    snippet: decl.name,
  }));
}

const DATA_STRING_SUFFIXES = [
  'title',
  'subtitle',
  'label',
  'headline',
  'sub',
  'eyebrow',
  'cta',
  'price',
  'name',
  'description',
  'caption',
  'placeholder',
  'tagline',
  'heading',
  'body',
  'message',
  'note',
];
const DATA_STRING_SUFFIX_RE = /\b[A-Z][A-Z0-9_]*_DATA\b(?:\.[A-Za-z_$][A-Za-z0-9_$]*)+/g;

function findTextChildrenViolations(src, rel) {
  const out = [];
  TEXT_OPEN_TAG_RE.lastIndex = 0;
  let m = TEXT_OPEN_TAG_RE.exec(src);
  while (m !== null) {
    const [full, openProps, inner] = m;
    m = TEXT_OPEN_TAG_RE.exec(src);
    if (/\bvalue=/.test(openProps)) continue;
    if (/\basChild\b/.test(openProps)) continue;
    const trimmed = inner.trim();
    if (trimmed.length === 0) continue;
    const dataChainHasStringSuffix = (() => {
      DATA_STRING_SUFFIX_RE.lastIndex = 0;
      let dm = DATA_STRING_SUFFIX_RE.exec(inner);
      while (dm !== null) {
        const chain = dm[0];
        const lastSegment = chain.split('.').pop();
        if (lastSegment && DATA_STRING_SUFFIXES.includes(lastSegment)) return true;
        dm = DATA_STRING_SUFFIX_RE.exec(inner);
      }
      return false;
    })();
    const looksLikeStaticCopy =
      /^[^{<][\s\S]*\w/.test(trimmed) ||
      /\b[A-Z][A-Z0-9_]*_COPY\b/.test(inner) ||
      dataChainHasStringSuffix ||
      /\{[\s\S]*(['"])[^'"]+\1[\s\S]*\}/.test(inner);
    if (!looksLikeStaticCopy) continue;
    const line = src.slice(0, full ? src.indexOf(full) : 0).split('\n').length;
    out.push({
      file: rel,
      line,
      rule: 'R3: <Text> static copy must flow through value=',
      hint: 'Use <Text value="…{name}…" params={{ name }} />. Runtime data (user input, server strings) stays as children. Style fragments via **bold** / *italic* / __underline__ inside the translated string.',
      snippet: full.replace(/\s+/g, ' ').slice(0, 160),
    });
  }
  return out;
}

function findValueAsPlaceholderViolations(src, rel, file) {
  if (ALLOW_RAW_PRIMITIVE_HTML_RE.test(file) || IS_TEST_OR_STORY(file)) return [];
  const out = [];
  const TAG_RE = /<(Input|Textarea)\b/g;
  let match = TAG_RE.exec(src);
  while (match !== null) {
    const start = match.index;
    const tagName = match[1];
    let depth = 0;
    let end = -1;
    for (let i = start + tagName.length + 1; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      else if (ch === '>' && depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1) {
      match = TAG_RE.exec(src);
      continue;
    }
    const openTag = src.slice(start, end + 1);
    if (/\bvalue=("[^"]+"|'[^']+')/.test(openTag)) {
      const line = src.slice(0, start).split('\n').length;
      out.push({
        file: rel,
        line,
        rule: `R3: <${tagName}> value="…" is not a placeholder`,
        hint: `Use placeholder="…" for hint copy, defaultValue="…" for an uncontrolled initial value, or seed React state via useState("…") for a controlled one.`,
        snippet: openTag.replace(/\s+/g, ' ').slice(0, 160),
      });
    }
    match = TAG_RE.exec(src);
  }
  return out;
}

const rules = [
  {
    name: 'R1: no inline style={}',
    pattern: /\bstyle=\{/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    // Allow inline styles that set CSS custom properties — the sanctioned escape for per-record
    // dynamic values (slide overlay opacity, bg-image URLs, --rating, alignment) that CVA can't hold.
    skipLine: (line) => /--[a-zA-Z]/.test(line),
    hint: 'Move static inline styles into a co-located *.styles.ts (CVA). Dynamic per-record values are allowed only via CSS custom properties (style={{ "--x": value }}).',
  },
  {
    name: 'R3: no raw <input> (use the Input primitive)',
    pattern: /<input\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    contextAwareSkip: (lines, i) => {
      const window = lines.slice(i, i + 6).join(' ');
      return /<input\b[\s\S]*?\btype=("|')(?:file|search)\1/.test(window);
    },
    hint: 'Use <Input label=… /> from @/design-system/primitives/Input/Input.',
  },
  {
    name: 'R3: no raw <textarea> (use the Textarea primitive)',
    pattern: /<textarea\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    skipLine: () => false,
    hint: 'Use <Textarea label=… /> from @/design-system/primitives/Textarea/Textarea.',
  },
  {
    name: 'R3: no raw <button (use the Button primitive)',
    pattern: /<button\b/,
    skipFile: (p) => ALLOW_RAW_PRIMITIVE_HTML_RE.test(p) || IS_TEST_OR_STORY(p),
    skipLine: () => false,
    hint: 'Use <Button variant=… /> for CTAs, or <Button asChild unstyled>…</Button> for a custom clickable surface.',
    contextAwareSkip: (lines, i) => {
      const start = Math.max(0, i - 6);
      for (let j = start; j < i; j += 1) {
        if (/<Button\b[^>]*\basChild\b/.test(lines[j])) return true;
      }
      return false;
    },
  },
  {
    name: 'R4: no hardcoded hex color',
    pattern: /#[0-9a-fA-F]{6}\b(?!`|\s*[`"'])/,
    skipFile: (p) => p.endsWith('.styles.ts'),
    skipLine: (line) => /data-node-id|@figma|\/\/|\/\*|^\s*\*/.test(line),
    hint: 'Use token classes (bg-primary, text-text, border-border) instead of hex.',
  },
  {
    name: 'R4: no arbitrary-value Tailwind class',
    pattern:
      /className=.*?(?:rounded-\[|text-\[(?:\d|#)|bg-\[#|tracking-\[|leading-\[|w-\[\d|h-\[\d(?!dvh)|p[xylrtb]?-\[\d|m[xylrtb]?-\[\d)/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    skipLine: () => false,
    hint: 'Use design-token utilities (rounded-button, text-base). Arbitrary values belong in .styles.ts only if unavoidable.',
  },
  {
    name: 'R3: no raw <p> (use Text as="p" value=…)',
    pattern: /<p\b/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p) || IS_TEST_OR_STORY(p),
    skipLine: (line) => /^\s*\/\/|^\s*\*/.test(line),
    hint: 'Use <Text as="p" value="…" /> for paragraph copy.',
  },
  {
    name: 'R3: no raw <h1>–<h6> (use Text as="h1" value=…)',
    pattern: /<h[1-6]\b/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p) || IS_TEST_OR_STORY(p),
    skipLine: (line) => /^\s*\/\/|^\s*\*/.test(line),
    hint: 'Use <Text as="h1" value="…" /> (or h2…h6) for headings.',
  },
  {
    name: 'R3: no raw <label> (use Input label=… or Text as="label")',
    pattern: /<label\b/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p) || IS_TEST_OR_STORY(p),
    skipLine: (line) => /^\s*\/\/|^\s*\*/.test(line),
    hint: 'Pass label=… to <Input>/<Textarea>, or use <Text as="label" value="…" />.',
  },
  {
    name: 'R3: no raw <img> (use the Image primitive)',
    pattern: /<img\b/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p) || IS_TEST_OR_STORY(p),
    skipLine: (line) => /^\s*\/\/|^\s*\*|eslint-disable/.test(line),
    hint: 'Use <Image src={…} alt="…" /> from @/design-system/primitives/Image/Image.',
  },
  {
    name: 'R3: no raw <a href=> (use the Link primitive)',
    pattern: /<a\s+[^>]*href=/,
    skipFile: (p) => ALLOW_RAW_HTML.has(p),
    skipLine: () => false,
    hint: 'Use <Link href={…} /> from @/design-system/primitives/Link/Link instead of a raw <a>.',
  },
  {
    name: 'R7: no string-literal href="/…" (use @/config/routes)',
    pattern: /href=(?:"|')\/[a-zA-Z]/,
    skipFile: (p) => p.endsWith('.styles.ts') || p.endsWith('.styles.tsx'),
    skipLine: () => false,
    hint: 'Import routes from @/config/routes and reference routes.<name>.',
  },
  {
    name: 'R8: next/link must be imported only via the Link primitive',
    pattern: /from\s+["']next\/link["']/,
    skipFile: (p) => ALLOW_IMPORTS_NEXT_LINK.has(p),
    skipLine: () => false,
    hint: 'Import Link from @/design-system/primitives/Link/Link, not next/link directly.',
  },
  {
    name: 'R8: next/font/google must be imported only from src/app/fonts.ts',
    pattern: /from\s+["']next\/font\/google["']/,
    skipFile: (p) => ALLOW_IMPORTS_NEXT_FONT.has(p),
    skipLine: () => false,
    hint: 'Import font variables from @/app/fonts; never re-define fonts elsewhere.',
  },
];

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (name === 'node_modules' || name === '.next') continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      out.push(full);
    }
  }
}

const files = [];
for (const d of SCAN_DIRS) walk(d, files);

const violations = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf-8');
  const lines = src.split('\n');

  if (!ALLOW_RAW_PRIMITIVE_HTML_RE.test(file) && !IS_TEST_OR_STORY(file)) {
    violations.push(...findTextChildrenViolations(src, rel));
  }
  violations.push(...findMultiComponentViolations(src, rel, file));
  violations.push(...findValueAsPlaceholderViolations(src, rel, file));

  for (const rule of rules) {
    if (rule.skipFile?.(file)) continue;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (rule.skipLine?.(line)) continue;
      if (rule.contextAwareSkip?.(lines, i)) continue;
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: rule.name,
          hint: rule.hint,
          snippet: line.trim().slice(0, 160),
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log(`[lint-conventions] ${files.length} files scanned — clean.`);
  process.exit(0);
}

console.error(`[lint-conventions] ${violations.length} violation${violations.length === 1 ? '' : 's'}:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    rule : ${v.rule}`);
  console.error(`    code : ${v.snippet}`);
  console.error(`    fix  : ${v.hint}\n`);
}
process.exit(1);
