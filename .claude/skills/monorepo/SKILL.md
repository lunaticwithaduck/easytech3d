---
name: monorepo
description: Patterns and gotchas for extracting and maintaining workspace packages in this pnpm/tsup monorepo — package boundary design, dts emission, Tailwind v4 cross-package CSS, and the strict-mode / library-typing interactions that surface when primitives ship from a published package.
activation:
  keywords: ["pnpm", "tsup", "workspace", "package", "exports", "transpilePackages", "dts", "use client", "tailwind v4", "@source", "yalc", "cva", "exactOptionalPropertyTypes", "noUncheckedIndexedAccess"]
---

## Purpose

This monorepo publishes packages under `@lunaticwithaduck/*` and consumes them from `apps/web` and (eventually) sibling repos like the admin app. When you extract a feature from `apps/web/src/` into `packages/<x>/`, a specific cluster of issues appears: tsup dts emission, Tailwind v4 CSS resolution, Next.js `'use client'` preservation, CVA + strict-TS variant typing, and pnpm peer-dep boundaries. This skill documents the resolutions that work in this codebase.

## Package shape and boundaries

### Co-locate generator CLIs with the artifacts they produce
A script that reads/writes files inside `packages/<x>/src/` belongs in `packages/<x>/scripts/`, not in `apps/web/scripts/`. The consumer's package script delegates: `"theme:generate": "pnpm --filter @lunaticwithaduck/<x> run theme:generate"`. Mirrors the `i18n:generate` pattern.

### Add `scripts` to the package's `files` field if those scripts ship
For yalc/published consumption, the `files` array in `package.json` controls what's included in the tarball. If you ship a CLI or generator alongside `dist/`, add `"scripts"` to `files`.

### Subpath exports must mirror tsup `entry`
Every leaf path you declare in `package.json` `exports` must have a matching entry in `tsup.config.ts`. Both must agree, otherwise consumers see resolution errors:

```json
"exports": {
  "./runtime/translate": { "import": "./dist/runtime/translate.js", "types": "./dist/runtime/translate.d.ts" },
  "./hooks": { "import": "./dist/hooks/index.js", "types": "./dist/hooks/index.d.ts" }
}
```
```ts
entry: ['src/index.ts', 'src/hooks/index.ts', 'src/runtime/*.ts'],
```

### Mis-classified "primitives" are easy to spot during extraction
Anything in `design/` that imports app-specific concerns (`@/config/routes`, role-specific configs) is composed nav, not a primitive. Per project rule R5 (`design/` = used by 2+ consumers), a Worker-only TabBar fails the test on its own. Move these to `apps/web/src/ui/components/composed/` BEFORE extracting the package.

## tsup dts emission

### Internal relative imports require `.js` extensions
rollup-dts (the dts emitter tsup uses) rejects `.ts` extensions in import specifiers. Even though source is `translations.gen.ts`, the import must read `from './translations.gen.js'`. Apply this rule to **every** relative import inside a package's `src/`. Bundler-mode TypeScript in apps doesn't require this, only the dts builder does.

### Two-phase dts strategy: defer, then re-enable
When primitive code has pre-existing strict-mode errors blocking dts, the immediate-unblock pattern is:
1. Set `dts: false` in `tsup.config.ts` and add `transpilePackages: ['@scope/pkg']` to the consumer's `next.config.ts`. Next reads source TS directly, types come from there.
2. Temporarily point `package.json` `exports.types` at source: `"types": "./src/index.ts"`.
3. Cleanup the type errors over time.
4. Flip `dts: true`, restore `"types": "./dist/index.d.ts"`, ship.

`transpilePackages` is the in-monorepo escape valve. External (yalc, npm) consumers always need real `.d.ts` files.

### Preserve `'use client'` directives across the bundle
tsup merges per-file `'use client'` directives away when bundling. The result is a single `dist/index.js` that Next can't categorize, and any client-only React API (`useState`, `useRef`, `createContext`) inside it triggers a server-component import error. For client-heavy design systems, blanket-mark the bundle:

```ts
// tsup.config.ts
export default defineConfig({
  banner: { js: '"use client";' },
  ...
});
```

Per-file directive preservation is harder (esbuild plugin or split entries). Banner is the right tool for primitives that are 95% client.

## Tailwind v4 across packages

### `@tailwindcss/postcss` does NOT honor package `exports` for CSS subpaths
Configuring `"./styles.css": "./src/design-system/theme.css"` in `package.json` `exports` doesn't let consumers do `@import "@scope/pkg/styles.css"`. The PostCSS resolver doesn't follow exports maps for CSS. Two workable paths:

1. **Direct relative path** in the consumer's `globals.css`:
   ```css
   @import "../../../../packages/webui/src/design-system/theme.css";
   ```
2. **Move `@import "tailwindcss"` out of the shared theme.css**. Theme files become pure-tokens (`@theme {}` block only) with no resolver dependencies. The consumer's `globals.css` does the tailwind import; theme.css is just imported afterward.

Path 2 is cleaner — tailwindcss is a *consumer* concern, not a token-file concern.

### `@source` directive is required for v4 to scan a package's source
When you import `theme.css` from a sibling package, Tailwind v4 still scans only the *consumer's* source by default. Utility classes used inside primitives in the package won't be emitted unless you explicitly point Tailwind at the package source:

```css
/* apps/web/src/app/globals.css */
@import "tailwindcss";
@import "../../../../packages/webui/src/design-system/theme.css";
@source "../../../../packages/webui/src";
```

Without `@source`, primitives ship with empty styles. This is the **#1 thing that breaks** when extracting a Tailwind-based design system into a package — verify by viewing one styled primitive in the dev server before mass-moving.

## next-intl runtime in a package

### `createNextIntlPlugin('./src/lib/i18n/request.ts')` requires a path inside the app
The plugin path is read at Next config eval time and must resolve *inside* the app. When you move the actual `getRequestConfig` implementation into a workspace package, **don't rewire the plugin** — keep a 1-line shim at the original path:

```ts
// apps/web/src/lib/i18n/request.ts
export { default } from '@lunaticwithaduck/i18n/runtime/request';
```

This costs nothing and avoids the brittle "is the plugin happy with a node_modules path?" question.

### tsup-friendly JSON imports use `with { type: 'json' }`
Dynamic `await import(\`./messages/\${locale}.json\`)` works in Next dev but fails through tsup because the path isn't statically known. Switch to static imports:

```ts
import en from '../messages/en.json' with { type: 'json' };
import bg from '../messages/bg.json' with { type: 'json' };
```

Works in Node 22+, TS 5.3+, and esbuild via tsup.

## Strict TS interactions

### CVA `Parameters<typeof X>[0]` is `T | undefined` and collapses `Omit<>`
CVA's variant config is optional, so `Parameters<typeof variant>[0]` is `ConfigVariants & ClassProp | undefined`. The trap:

```ts
type Variants = Parameters<typeof variant>[0]; // T | undefined
type Props = Omit<Variants, 'disabled'>;       // → resolves to {}
// Because: keyof (T | undefined) = keyof T & keyof undefined = never
//          Pick<T | undefined, never> = {}
```

Symptom: `Property 'variant' does not exist on type 'Props'` even though it's defined in CVA. Fix at the variant-type alias once:

```ts
export type InputWrapperVariants = NonNullable<Parameters<typeof inputWrapperVariants>[0]>;
```

Apply this to **every** CVA-backed primitive whose consumer uses `Omit<>` on the variants.

### CVA variants include `null`; coerce at the call site
CVA's TypeScript inference is `'sm' | 'md' | 'lg' | null | undefined`. Destructuring with `= 'md'` only catches undefined, not null. When passing the value to a target with stricter typing (Radix `orientation: 'horizontal' | 'vertical'`, sibling skeleton, sized-map lookup), use one of three patterns:

```tsx
// 1. Coerce to default for non-null targets:
<RadixSeparator orientation={orientation ?? 'horizontal'} />

// 2. Coerce to undefined for targets that accept undefined:
<Skeleton size={size ?? undefined} />

// 3. Coerce to default for sized-map lookup:
const iconSize = iconSizeMap[size ?? 'md'];
```

### `exactOptionalPropertyTypes: true` requires `?: T | undefined` for forwarded values
Under strict optional, `className?: string` means "missing OR string" — passing `className={undefined}` explicitly is rejected. When one component destructures `{ className }` (now `string | undefined`) and forwards it to a sub-component, the sub-component's prop signature must explicitly include `| undefined`:

```ts
// Skeleton + sub-component prop signatures:
type SkeletonProps = {
  size?: keyof typeof sizeMap | undefined;
  className?: string | undefined;
  items?: number | undefined;
};
```

The convention extends to all forwarded optional props. Verbose but unavoidable under `exactOptional`.

### Radix primitive Roots reject `boolean | undefined`
Radix typings (`@radix-ui/react-checkbox`, `@radix-ui/react-select`, etc.) declare `disabled?: boolean` (no `| undefined`). Coerce **per call site** at the boundary:

```tsx
<CheckboxPrimitive.Root checked={checked ?? false} disabled={disabled ?? false} />
<SelectPrimitive.Root disabled={disabled ?? false} />
```

This is the boundary into Radix — there's no widening Radix's package types from the consumer.

### `motion.button` rejects spread props with `| undefined` — cast to `Record<string, unknown>`
Motion's `HTMLMotionProps<'button'>` is stricter than React's `ButtonHTMLAttributes` under `exactOptional`. Spreading an HTML rest into `motion.button` produces a 290-prop union mismatch error even though the runtime is fine. The smallest cast that bypasses the comparison:

```tsx
<motion.button {...(domRest as Record<string, unknown>)}>
```

Casting to `React.ButtonHTMLAttributes<HTMLButtonElement>` does NOT help because that type carries the same `| undefined` optionals.

### `noUncheckedIndexedAccess: true` on indexed math
`sorted[i] - sorted[i - 1]` is `(number | undefined) - (number | undefined)` under strict indexed access. Cache and guard:

```ts
for (let i = 0; i < sorted.length; i++) {
  const cur = sorted[i];
  if (cur === undefined) continue;
  const prev = i > 0 ? sorted[i - 1] : undefined;
  if (prev !== undefined && cur - prev > 1) {
    pages.push('ellipsis');
  }
  pages.push(cur);
}
```

Same rule for keyed JSON lookups: `messageBundles[locale]` is `T | undefined`. Use a switch or `if` chain, not `a ?? b` indexing — the latter doesn't satisfy `exactOptionalPropertyTypes` for downstream APIs.
