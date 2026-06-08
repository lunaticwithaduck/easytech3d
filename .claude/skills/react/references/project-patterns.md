# React — majstorbg project patterns

Autolearned from `workflows/done/*.sc` on 2026-04-23. Sources:
`client-tab-bar.sc`, `client-flow-placeholders.sc`, `client-home.sc`,
`client-profile-dashboard-shell.sc`.

These are project-specific render, extraction, and i18n patterns that
extend `apps/web/.claude/skills/project-conventions.md`. Cross-reference
that skill for the folder-discipline, `<Text value=>`, and primitive
rules these patterns build on.

## Render-state discriminant + exhaustive switch

RTK Query pages return `{ data, isLoading, error }`. Don't render
branches inline via ternary ladder — resolve a `kind` discriminant
outside JSX and switch on it.

```ts
type JobsStateKind = 'loading' | 'error' | 'empty' | 'list';

function resolveJobsStateKind({ isLoading, hasError, isEmpty }: {
  isLoading: boolean; hasError: boolean; isEmpty: boolean;
}): JobsStateKind {
  if (isLoading) return 'loading';
  if (hasError)  return 'error';
  if (isEmpty)   return 'empty';
  return 'list';
}

const kind = resolveJobsStateKind({ isLoading, hasError: Boolean(error), isEmpty: jobs.length === 0 });

const renderJobsState = () => {
  switch (kind) {
    case 'loading': return <JobsLoading />;
    case 'error':   return <JobsError onRetry={refetch} />;
    case 'empty':   return <JobsEmpty />;
    case 'list':    return <JobsList jobs={jobs} />;
  }
};
```

**Why:** precedence becomes explicit code, each branch is its own
testable component, and TypeScript enforces exhaustiveness.

**When to apply:** every fetch-backed screen in `apps/web/src/app/`.
Match the nearest precedent's state names (`loaded` vs `list`) —
reviewers flag divergence more reliably than they flag absent
abstraction.

## Each render branch is its own component

Under `./components/<Name>/<Name>.tsx` with colocated `<Name>.styles.ts`.
The page-level `page.styles.ts` keeps only always-rendered
shell/header styles; state-branch styles move with their component.
Follows R5 folder discipline: single-use children inside the parent's
folder, not in `composed/`.

## Small-affordance extraction threshold

Pull an inline widget (unread pill, empty state, status badge) into
its own `./components/<Name>/` the moment a reviewer would call it
page noise — not waiting for reuse. Criteria (all three):

- The widget has ≥2-class style cluster of its own.
- The widget has a self-contained render guard (`if (count <= 0)
  return null`) or a visibly distinct branch.
- The parent reads more clearly as `<Name prop=… />` than as inline
  JSX.

Move the render guard *inside* the extracted component so the call
site stays flat (`<UnreadPill count={n} />` — no `count > 0 ? … :
null` in the parent).

## `<Section label items>` reuse

When a page renders two or more visually identical grouping blocks
(TODAY/EARLIER, DOING/DONE, TRENDING/RECENT), collapse them into one
reusable section keyed by `label + items`:

```tsx
type NotificationSectionProps = {
  label: TranslationDefault;
  items: readonly NotificationItem[];
};

export function NotificationSection({ label, items }: NotificationSectionProps) {
  if (items.length === 0) return null;
  return (
    <section className={styles.section}>
      <Text as="span" size="xs" color="muted" className={styles.label} value={label} />
      <div className={styles.list}>
        {items.map((item) => <Row key={item.id} item={item} />)}
      </div>
    </section>
  );
}
```

**Rules:**
- `label` MUST be typed `TranslationDefault` (not `string`) so the
  i18n literal-union survives.
- Internal empty-list guard returns `null` — the parent just lists
  sections back-to-back, no wrapper ternaries.

## Push derivation into the child that consumes it

When the page owns `useMemo` state read only by one child, move the
`useMemo` into the child and let the page pass raw upstream data:

```tsx
// BEFORE — page owns derivation
const { activeJobs, totalOffers, continueJob } = useMemo(...);
<ActiveSummary activeJobs={…} totalOffers={…} continueJob={…} />

// AFTER — child owns derivation
<ActiveSummary jobs={jobs ?? []} />
```

**Why:** the page becomes a thin orchestrator (one hook, one switch),
domain logic lives with its consumer, and the `useMemo` dep array
shrinks. Lift back up only when a 2nd consumer needs the same values.

## Mirror-a-primitive pattern

When introducing a role-scoped sibling of an existing design primitive
(e.g. `ClientTabBar` next to `WorkerTabBar`): keep structure **1:1** —
same shell classes, same CVA variants, same `active` prop shape — and
swap ONLY the metadata table. Re-using the CVA object isn't required
(role-scoped primitives can diverge later), but keep them identical
at birth so a future unifier can collapse them.

## `config.ts` vs `constants.ts` — not interchangeable

Per R2 folder rules:

- `./config/constants.ts` — **copy objects** (eyebrow, headline,
  labels, CTA text) that flow through `<Text value=>`. Values
  satisfy `TranslationDefault`.
- `./config/config.ts` — **structured data** (arrays of objects
  combining routes, component refs like `LucideIcon`, and metadata).
  Not translated; imported as-is.

For primitives like tab bars, menu definitions, or step registries:
extract the array-of-entries to `./config/config.ts`; keep only the
component's JSX + props in the `.tsx`.

## ICU registers, not ICU branches

For grammatical variations that differ by register — greetings
(morning/afternoon/evening), salutations, formal/informal *you*,
gender-specific forms — use **one translation key per register**, not
a single monolithic ICU expression that branches.

```ts
// ✅ One key per register
greetingMorning:   'Good morning, {name}.',
greetingAfternoon: 'Good afternoon, {name}.',
greetingEvening:   'Good evening, {name}.',

function pickGreeting(hour: number): GreetingKey {
  if (hour < 12) return HOME_COPY.greetingMorning;
  if (hour < 18) return HOME_COPY.greetingAfternoon;
  return HOME_COPY.greetingEvening;
}

<Text value={pickGreeting(hour)} params={{ name }} />
```

**Why:** natural-language greetings don't interchange structurally —
Bulgarian "добро утро" is not "добър ден" with a word swap. ICU
branching forces an artificial structure; translators need one key
per register.

## Relative-time rendering: one ICU plural per unit

Don't branch on unit inside one ICU — grammatical plurals are
per-unit (`1 min` vs `# min`, `1 hr` vs `# hr`). Helper + dispatch
map:

```ts
export function formatRelativeTime(iso: string):
  { mode: 'minutes' | 'hours' | 'days'; value: number } { … }
```

```ts
// config/constants.ts — one ICU plural per unit
relativeMinutes: '{count, plural, =1 {1 min ago} other {# min ago}}',
relativeHours:   '{count, plural, =1 {1 hr ago} other {# hr ago}}',
relativeDays:    '{count, plural, =1 {1 day ago} other {# days ago}}',
```

```tsx
const RELATIVE_VALUE = {
  minutes: COPY.relativeMinutes,
  hours:   COPY.relativeHours,
  days:    COPY.relativeDays,
} as const;
const rel = formatRelativeTime(item.lastMessageAt);
<Text value={RELATIVE_VALUE[rel.mode]} params={{ count: rel.value }} />
```

## Primary-placeholder-screen pattern

When a new primitive (tab bar, sidebar) references routes that don't
exist yet, don't leave users landing on 404s. Ship **primary**
versions of each target screen — layout + static fixture content
only — and say so in the PR body:

> These are intentionally **primary versions** — layout + static
> fixture content only. Real data + editable fields + preferences
> land in a follow-up PR.

This framing tells reviewers the half-finished look is scope, not
incompleteness. Mock fixtures live under `src/lib/mocks/` alongside
real data types, never inlined in the screen.

## Route-split when one URL served two audiences

When `/` previously served both the anonymous intro *and* the
logged-in landing (because the logged-in experience hadn't been built
yet), carve out a dedicated post-login route (e.g. `/home`) as soon
as there's real dashboard content. In the same PR:

- Move `routes.client.home` from `/` to `/home`.
- Switch login-redirect targets from the stopgap (`routes.post.list`)
  to the new `/home`.
- Leave `/` as the pre-login intro untouched.

Otherwise "is the user logged in?" conditionals accumulate inside a
single page file.

## Cross-screen primitive reuse — the 3rd-consumer promotion rule

R5 says `design/` = reused across 2+ consumers, but the threshold
that actually *earns* the promotion is the 3rd consumer. Two
consumers? Cross-import:

```tsx
import { InboxCard } from '../chat/components/InboxCard/InboxCard';
```

Premature promotion flattens a context-rich `./components/` folder
into a generic `design/` primitive and forces reasoning about every
future variant. Promote on the 3rd consumer; until then, cross-import.

## Pattern-reuse over ad-hoc ternaries

Once one screen adopts a particular render-state discipline (e.g.
`resolve<X>StateKind + switch`), every fetch-backed screen built
after it should adopt the same shape — even if a 3-branch ternary
looks "fine" on its own. Reviewers flag divergence more reliably
than they flag the original ladder, because the question shifts from
"is this OK?" to "why is this one different?". Match the nearest
precedent.

## New lint rules catch violations retroactively on develop merges

When a PR lands a new `lint:conventions` rule, every in-flight
branch that later merges `develop` has to pass the rule — even for
code the branch wrote *before* the rule existed. The pre-commit hook
runs on the merge commit itself, so an otherwise clean merge can
fail.

Workflow when it happens:

1. Resolve content conflicts (translation files, etc.).
2. Run `pnpm lint:conventions` locally before attempting the merge
   commit — it will surface the new rule's violations.
3. Fix them like any other review comment (extract helpers, rename,
   etc.), stage the fixes, then `git commit --no-edit` to close the
   merge.

Categories observed so far:

- **R3 Text-children rule**: already-shipped screens with literal
  copy in `<Text>…</Text>` trip on merge.
- **R5 one-component-per-file**: `page.tsx` files that inline
  `SectionHeader`, `RowIconChip`, or similar one-off helpers trip on
  merge.

Prefer fixing over suppressing — the extracted helpers are a net
improvement and typically land in 2-3 small files.

## One-off page helpers belong in `./components/<Name>/`

A `page.tsx` helper that renders JSX and takes a prop shape belongs
in `./components/<Name>/<Name>.tsx`, NOT inline — even when it's
used once. Enforced by `lint:conventions` (R5).

Shape:

```
./components/<Name>/
  <Name>.tsx         — default export + named export
  <Name>.styles.ts   — when the helper carries a className cluster
                       wider than a handful of tokens
```

Non-component helpers (pure functions, constants, maps) go under
`./utils/<name>.utils.ts` in the same component folder. The lint
rule only catches *PascalCase JSX-producing* declarations, so a
module-scope `STAR_LINE` map or `formatRating()` helper can stay in
the page file — but moving it to `utils/` makes the split between
"renders" and "derives" much easier to scan.

## `translations.gen.ts` merge conflicts → regenerate, don't hand-merge

`translations.gen.ts` is derived from `messages/en.json` +
`messages/bg.json` via `pnpm i18n:generate`. When it conflicts on a
merge, don't hand-edit it — resolve the JSON conflicts (if any),
run the generator, then `git add` the regenerated file. One command,
clean diff.

## Feature-flag gate shape for dashboard screens

Worker + client profile dashboards both settled on the same shape:

- Master flag (`<module>Hub`) gates the whole route at
  `layout.tsx` → `notFound()` when off.
- Per-section sub-flags (`<module>Skills`, `<module>Reviews`, …)
  gate each section inside `page.tsx` — sections conditionally
  render, hub tiles render disabled/muted when their flag is off.

When scaffolding the next dashboard module, copy this shape
verbatim: `getFeatureFlag` calls collected into a single
`readXxxSectionFlags()` helper, sections wrapped in
`{flags.xxx ? <Section … /> : null}`, tiles decorated with an
`interactive` prop that drops the `<Link>` wrapper when false.
