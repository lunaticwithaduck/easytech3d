---
name: git-review
description: This skill should be used when the user asks about "code review", "pull request", "PR review", "git workflow", "branching strategy", "git flow", "trunk-based", "conventional commits", "merge conflict", "git rebase", "cherry-pick", "git bisect", "monorepo", "commit message", "PR template", or needs git workflow and code review knowledge.
keywords:
  - code review
  - pull request
  - PR review
  - git workflow
  - branching strategy
  - git flow
  - trunk-based
  - conventional commits
  - merge conflict
  - git rebase
  - cherry-pick
  - git bisect
  - monorepo
  - commit message
  - PR template
---

# Git & Code Review

Workflow-layer skill covering branching strategies, commit conventions, PR review processes, conflict resolution, and monorepo patterns. Focuses on team collaboration best practices.

## Branching Strategy Decision Tree

```
What's your team and release cadence?
├── Small team (1-5), continuous deployment
│   └── Trunk-Based Development
│       ├── main branch is always deployable
│       ├── Short-lived feature branches (< 1 day)
│       ├── Feature flags for incomplete work
│       └── Deploy on every merge to main
│
├── Medium team, regular releases
│   └── GitHub Flow
│       ├── main branch is always deployable
│       ├── Feature branches from main
│       ├── PR review required
│       └── Merge to main triggers deploy
│
├── Large team, scheduled releases, compliance needs
│   └── Git Flow
│       ├── main (production) + develop (integration)
│       ├── feature/* branches from develop
│       ├── release/* branches for stabilization
│       └── hotfix/* branches from main
│
└── Open source project
    └── Forking Workflow
        ├── Contributors fork the repo
        ├── Feature branches in fork
        └── PR to upstream main
```

**Strategy Comparison:**

| Strategy | Complexity | Best For | Risk |
|----------|-----------|----------|------|
| Trunk-based | Low | Small teams, CI/CD mature | Needs feature flags |
| GitHub Flow | Low-Medium | Most teams | None (good default) |
| Git Flow | High | Scheduled releases, compliance | Branch overhead |
| Forking | Medium | Open source | Sync overhead |

**Default recommendation:** GitHub Flow for most teams.

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types Table

| Type | When | Example |
|------|------|---------|
| `feat` | New feature | `feat(auth): add Google OAuth login` |
| `fix` | Bug fix | `fix(cart): correct total calculation with discounts` |
| `docs` | Documentation only | `docs(api): add rate limiting to API docs` |
| `style` | Formatting, no code change | `style: fix linting errors in utils` |
| `refactor` | Code change, no behavior change | `refactor(db): extract query helpers` |
| `perf` | Performance improvement | `perf(list): virtualize long item lists` |
| `test` | Adding or fixing tests | `test(auth): add JWT expiration tests` |
| `build` | Build system or dependencies | `build: upgrade to Node 20` |
| `ci` | CI configuration | `ci: add Playwright to GitHub Actions` |
| `chore` | Maintenance tasks | `chore: clean up unused dependencies` |

### Commit Message Rules

- Subject line: imperative mood, max 72 characters
- Body: explain WHY, not WHAT (the diff shows what)
- Breaking changes: add `!` after type or `BREAKING CHANGE:` in footer
- Reference issues: `Closes #123` or `Fixes #456` in footer

```
feat(api)!: change authentication to use JWT

Migrate from session-based auth to JWT tokens for better
scalability across multiple server instances.

Access tokens expire in 15 minutes with refresh token rotation.

BREAKING CHANGE: All API clients must send Authorization: Bearer header
instead of session cookies.

Closes #234
```

## PR Review Checklist

### For the Reviewer

**Code Quality:**
- [ ] Code is readable and self-explanatory
- [ ] No unnecessary complexity or over-engineering
- [ ] Follows existing codebase conventions
- [ ] No dead code, commented-out code, or TODOs without issues
- [ ] Error handling is appropriate

**Security:**
- [ ] No hardcoded secrets or credentials
- [ ] User input is validated
- [ ] No SQL injection, XSS, or other injection vulnerabilities
- [ ] Authorization checks in place for protected operations

**Performance:**
- [ ] No N+1 queries
- [ ] No unnecessary re-renders (React)
- [ ] Large lists are paginated or virtualized
- [ ] No memory leaks (cleanup in effects, event listeners)

**Testing:**
- [ ] New code has appropriate tests
- [ ] Edge cases are covered
- [ ] Tests are readable and maintainable
- [ ] Existing tests still pass

**Architecture:**
- [ ] Changes are in the right layer/module
- [ ] No circular dependencies introduced
- [ ] API contracts are backwards compatible (or versioned)
- [ ] Database migrations are reversible

### For the Author

- [ ] PR is focused (single concern)
- [ ] Description explains the WHY
- [ ] Screenshots for UI changes
- [ ] Self-reviewed the diff before requesting review
- [ ] Tests pass locally and in CI
- [ ] No merge conflicts with target branch

## Merge Conflict Resolution

### Workflow

```bash
# 1. Update your feature branch with latest main
git fetch origin
git rebase origin/main
# OR: git merge origin/main (creates merge commit)

# 2. When conflicts appear, check status
git status
# Shows files with conflicts

# 3. For each conflicted file, resolve:
# - Open file, look for <<<<<<< / ======= / >>>>>>> markers
# - Choose correct changes (may combine both sides)
# - Remove conflict markers

# 4. Mark resolved and continue
git add <resolved-file>
git rebase --continue   # if rebasing
# OR: git commit         # if merging

# 5. If rebase goes wrong, abort and start over
git rebase --abort
```

### Conflict Prevention

- Keep feature branches short-lived (< 3 days)
- Regularly sync with main (`git rebase origin/main`)
- Communicate about overlapping file changes
- Break large features into smaller PRs

## Git Commands Quick Reference

### Rebase (Rewrite History)

```bash
# Rebase feature branch onto latest main
git rebase origin/main

# Interactive rebase (squash, reword, reorder last 3 commits)
git rebase -i HEAD~3
# In editor: pick/squash/reword/drop for each commit
```

### Cherry-Pick (Copy Specific Commits)

```bash
# Apply a specific commit to current branch
git cherry-pick <commit-hash>

# Cherry-pick without auto-commit
git cherry-pick --no-commit <commit-hash>
```

### Bisect (Find Bug-Introducing Commit)

```bash
git bisect start
git bisect bad                    # current commit is broken
git bisect good <known-good-hash> # this commit was fine

# Git checks out middle commit — test it, then:
git bisect good  # if this commit works
git bisect bad   # if this commit is broken
# Repeat until git identifies the first bad commit

git bisect reset  # return to original state
```

### Stash (Temporary Storage)

```bash
git stash                    # stash working changes
git stash -u                 # include untracked files
git stash list               # show all stashes
git stash pop                # apply and remove latest stash
git stash apply stash@{2}    # apply specific stash, keep it
git stash drop stash@{0}     # delete specific stash
```

### Other Useful Commands

```bash
git log --oneline --graph -20      # visual commit history
git diff --stat main..HEAD         # summary of changes vs main
git reflog                         # history of HEAD movements (recovery)
git blame -L 10,20 file.ts        # who changed lines 10-20
git shortlog -sn                   # commit count by author
```

## Monorepo Patterns

| Tool | Type | Best For |
|------|------|----------|
| **Turborepo** | Build system | Next.js / Vercel ecosystem, simple setup |
| **Nx** | Build system + workspace | Large monorepos, plugin ecosystem, caching |
| **pnpm workspaces** | Package manager | Dependency management, no build orchestration |
| **npm workspaces** | Package manager | Simple, no extra tools |

### Turborepo Structure

```
my-monorepo/
  apps/
    web/          # Next.js frontend
    api/          # Express/Fastify backend
    mobile/       # React Native app
  packages/
    ui/           # Shared component library
    config/       # Shared ESLint, TypeScript configs
    db/           # Prisma schema and client
    utils/        # Shared utility functions
  turbo.json
  package.json
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["build"] }
  }
}
```

## PR Template

```markdown
## What

<!-- Brief description of the change -->

## Why

<!-- Motivation: why is this change needed? Link to issue. -->

Closes #

## How

<!-- Implementation approach: key decisions and trade-offs -->

## Testing

<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manually tested locally

## Screenshots

<!-- For UI changes: before/after screenshots -->

## Checklist

- [ ] Self-reviewed the diff
- [ ] No console.logs or debugging code
- [ ] Types are correct (no `any`)
- [ ] Follows existing code conventions
```

## Git Hooks (Husky + lint-staged)

```bash
# Install
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged

# .husky/commit-msg
npx commitlint --edit $1
```

## Code Review Best Practices

**How to give feedback:**
- Be specific: "This query will N+1" not "This is slow"
- Suggest alternatives: "Consider using `useMemo` here because..."
- Ask questions: "What happens if `user` is null here?"
- Prefix with severity: `nit:`, `suggestion:`, `blocker:`
- Praise good code: "Nice pattern here!"

**What to focus on (high to low impact):**
1. Correctness — does it do what it should?
2. Security — any vulnerabilities?
3. Architecture — right abstraction level?
4. Performance — any obvious issues?
5. Readability — can the next person understand it?
6. Style — (should be automated, don't comment on this)

## Common Git Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Committing secrets | Credentials in git history | `git-secrets`, `.gitignore`, BFG to scrub |
| Giant PRs (500+ lines) | Slow review, bugs slip through | Break into smaller, focused PRs |
| Merge commits instead of rebase | Cluttered history | Use rebase for feature branches |
| Force-pushing shared branches | Teammates lose work | Only force-push YOUR branches |
| No .gitignore | node_modules, .env committed | Set up .gitignore on project init |
| Vague commit messages | "fix stuff", "updates" | Follow conventional commits format |
| Long-lived feature branches | Painful merges, divergence | Keep branches < 3 days, use feature flags |
| Not pulling before pushing | Rejected push, merge conflicts | `git pull --rebase` before push |
| Amending public commits | History rewrite breaks teammates | Only amend unpushed commits |
| No branch protection | Direct pushes to main | Require PR + review + CI pass |

## Pre-Delivery Checklist

- [ ] Branch protection rules on main (require PR, review, CI)
- [ ] Conventional commits enforced (commitlint)
- [ ] Pre-commit hooks running (lint-staged + Husky)
- [ ] PR template in `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] CI runs on every PR
- [ ] Branching strategy documented and agreed on
- [ ] `.gitignore` covers all generated/sensitive files

## References

- `references/git-advanced.md` — interactive rebase, reflog recovery, worktrees, submodules
- `references/monorepo-patterns.md` — Turborepo and Nx deep dive, workspace configuration
- `references/code-review-guide.md` — review strategies, feedback templates, team workflows
- `references/branch-strategies.md` — trunk-based, GitHub Flow, Git Flow detailed comparison
- `examples/husky-setup.md` — complete Husky + lint-staged + commitlint configuration
- `examples/pr-workflow.md` — end-to-end PR workflow from branch to merge
