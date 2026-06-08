Mark a task as complete and move it from workflows/tasks/ to workflows/done/.

## Instructions

1. The argument is the task filename: $ARGUMENTS
2. If no filename is provided:
   - List all files in `workflows/tasks/`
   - Ask the user which one to complete
3. Read the task file from `workflows/tasks/[filename]`
4. If the file does not exist, show an error and list available tasks
5. Review the acceptance criteria:
   - Show all criteria to the user
   - If any are unchecked, ask: "These criteria are not yet checked. Mark as complete anyway?"
   - If the user confirms, check all criteria
5b. **QA gate (screen tasks only)** — if the task file contains a `## QA`
   section with `Route:`, `Auth:`, and `Criteria:` lines, run the QA agent
   before flipping status:
   - Spawn the `qa` subagent (Agent tool, `subagent_type: "qa"`) and pass
     the `## QA` block verbatim as input.
   - Wait for its structured QA Report (verdict line, per-criterion
     PASS/FAIL, runner output, screenshot paths).
   - **If verdict is FAIL**: stop the command. Do not move the file. Print
     the failed assertions + screenshot paths so the user can fix and
     re-invoke `/complete`.
   - **If verdict is PASS**: keep the report — it gets appended to the
     Outcome section in step 6.
   - **If the `qa` subagent type is not registered** (custom agents need a
     Claude Code session restart after `.claude/agents/qa.md` is added):
     warn the user once with "QA agent not loaded — restart Claude Code to
     enable the gate, or pass `--skip-qa` to bypass for this run." Do not
     hard-fail; continue without the gate so `/complete` still works.
   - **Skip the gate entirely** when:
     - The task has no `## QA` section (treated as non-screen task), OR
     - The user passes `--skip-qa` as an argument (log the reason in the
       Outcome).
6. Update the file content:
   - Change `status: in-progress` to `status: done`
   - Add `completed: [today's date YYYY-MM-DD]` to frontmatter
   - Add an `## Outcome` section at the bottom:
     ```
     ## Outcome

     Completed on [date]. [Ask user for a brief summary of what was done]
     ```
   - If step 5b produced a PASS QA Report, append it verbatim under a
     `## QA Report` heading inside the Outcome.
   - If step 5b was skipped via `--skip-qa`, append a one-line note:
     `QA gate skipped: [user-supplied reason or "non-screen task"]`.
7. Move the file:
   - Keep the original task filename — use it as-is in `workflows/done/`
   - Write the updated content to `workflows/done/[original-filename].md`
   - Delete the original from `workflows/tasks/[filename]`
8. Skill Candidating — MANDATORY, cannot be skipped silently:
   You MUST write out the following evaluation explicitly in your response before deciding:

   **Skill candidate evaluation:**
   - Technologies/frameworks touched in this task: [list them]
   - Domain-specific knowledge involved (concrete facts, patterns, anti-patterns): [describe or "none"]
   - Verdict: GENERATE or SKIP
   - Reason: [one sentence]

   The verdict must follow these rules:
   - GENERATE if the task touched a named technology/framework AND involved non-obvious patterns,
     gotchas, or constraints specific to that technology (e.g. PixiJS TextStyle caching, SQL index
     types, Dockerfile layer ordering, WCAG contrast ratios)
   - SKIP only if the task was pure methodology (renaming, restructuring, process) with zero
     technology-specific knowledge — this should be rare
   - When in doubt, GENERATE — a weak `.sc` is better than a missing one

   If verdict is GENERATE:
   - Scan `workflows/done/` for existing `.sc` files and extract their `domain:` values
   - Reuse an existing domain name if it covers the same technology area
   - Only coin a new name if no overlap — use broad technology names, NOT sub-topics:
     `graphql` not `graphql-schema`, `postgres` not `postgres-indexing`, `react` not `react-hooks`
   - Write `workflows/done/[original-filename].sc` with:
     - Frontmatter: `domain`, `source_task`, `date`, `keywords` (3-6 trigger words)
     - `## Extracted Knowledge` — specific patterns/facts learned
     - `## Proposed Skill Content` — what a skill file would contain
   - After writing the `.sc` file, check the synthesis threshold:
     1. Count all `.sc` files in `workflows/done/` that share the same `domain:` value
     2. Check whether `.claude/skills/[domain].md` already exists
     3. If count ≥ 3 AND no skill file exists yet: **synthesize the skill now, in this response**
        — you already have the `.sc` content in context. Proceed immediately:
        a. Create `.claude/skills/[domain].md` using the skill format:
           ```
           ---
           name: [domain]
           description: One-line description of what this skill covers
           activation:
             keywords: ["kw1", "kw2", "kw3"]
           ---
           ## Purpose
           ## [Section per major topic from .sc files]
           ## Failure Modes  ← only if .sc files contain observed failures
           ```
        b. Add `[domain]` to `.claude/skills/skill-rules.json` with keywords from the `.sc` files
        c. Append 3-5 fixture prompts to `bench/fixtures/skill-prompts.json`
        d. Scan for any other domain with ≥3 `.sc` files but no skill yet — if found, synthesize it too
        e. Tell the user: "Auto-generated skill: [domain]"
        Within this same branch (count ≥ 3), also write `autolearn-pending` as a fallback
        so the hook can catch it if synthesis was interrupted or skipped:
        - Write the domain name (plain text) to whichever exists:
          - `.claude/autolearn-pending` — if `.claude/` directory exists at project root
          - `.cursor/autolearn-pending` — if `.cursor/` directory exists at project root
          - `.github/autolearn-pending` — if `.github/` directory exists at project root
        - Delete the pending file only after synthesis completes successfully.
     4. If count < 3: do nothing — threshold not yet reached. Do NOT write `autolearn-pending`.

   Also evaluate: "Did this task reveal that an *existing* skill gave wrong or misleading guidance?"
   - If YES: add `## Failure Modes Observed` to the `.sc` (or the done file Outcome section):
     - Which skill fired, what it said, what was actually correct, and under what condition it was wrong
     - "The skill was wrong" is not useful. Be specific about the condition and the correct alternative.
9. Confirm completion with:
   - Task title
   - Time from creation to completion (if dates are available)
   - Whether a `.sc` skill candidate was generated (and for which domain)
   - Whether a skill was synthesized
   - Suggest: "Use `/status` to see the current pipeline overview."
