#!/usr/bin/env node
'use strict';
// skill-detector.js - UserPromptSubmit hook for deterministic skill pre-filtering
//
// Reads the user prompt from stdin JSON, matches against skill-rules.json keywords,
// and injects matched skill content directly as context.
//
// Also checks for autolearn-pending flag and injects synthesis instructions.
//
// Outputs NOTHING if no skills match and no synthesis pending — zero overhead.

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const rulesPath = path.join(ROOT_DIR, '.claude', 'skills', 'skill-rules.json');
const skillDir = path.join(ROOT_DIR, '.claude', 'skills');
const pendingFile = path.join(ROOT_DIR, '.claude', 'autolearn-pending');
const usageFile = path.join(ROOT_DIR, '.claude', 'skill-usage.json');

if (!fs.existsSync(rulesPath)) process.exit(0);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  if (!input.trim()) process.exit(0);

  let prompt = '';
  try {
    const data = JSON.parse(input);
    prompt = data.prompt || data.message || data.user_prompt || '';
  } catch (_e) {
    process.exit(0);
  }

  if (!prompt) process.exit(0);

  let rules;
  try {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (_e) {
    process.exit(0);
  }

  const promptLower = prompt.toLowerCase();
  const synthesisPending = fs.existsSync(pendingFile);

  // Pipeline reminder: inject based on workflows/tasks/ state
  if (!synthesisPending) {
    const tasksDir = path.join(ROOT_DIR, 'workflows', 'tasks');
    if (fs.existsSync(tasksDir)) {
      const taskFiles = fs.readdirSync(tasksDir).filter((f) => !f.startsWith('.'));
      if (taskFiles.length === 0) {
        // Empty — enforce creation before any work begins
        process.stdout.write('[REQUIRED — Before writing any code or files]\n');
        process.stdout.write('workflows/tasks/ is empty. You MUST do this first:\n');
        process.stdout.write(
          '1. Break the work into logical units and create one task .md file per unit in workflows/tasks/\n',
        );
        process.stdout.write('2. Implement one task at a time\n');
        process.stdout.write('3. Run /complete after each task before starting the next\n');
        process.stdout.write(
          'Do not write any implementation files until at least one task file exists in workflows/tasks/.\n\n',
        );
      } else {
        // Non-empty — soft nudge to complete before starting new work
        const names = taskFiles.join(', ');
        process.stdout.write(`Open task(s) in workflows/tasks/: ${names}\n`);
        process.stdout.write('Run /complete on any finished tasks before starting new work.\n\n');
      }
    }
  }

  // Match skills against prompt keywords
  const matched = [];
  for (const [skillName, rule] of Object.entries(rules)) {
    const keywords = rule.keywords || [];
    if (keywords.some((kw) => promptLower.includes(kw.toLowerCase()))) {
      matched.push(skillName);
    }
  }

  // Update skill-usage.json for matched skills (for decay tracking)
  if (matched.length > 0) {
    let usage = {};
    try {
      if (fs.existsSync(usageFile)) {
        usage = JSON.parse(fs.readFileSync(usageFile, 'utf8'));
      }
    } catch (_e) {}

    const today = new Date().toISOString().slice(0, 10);
    for (const skillName of matched) {
      if (!usage[skillName]) usage[skillName] = { last_used: today, used_count: 0 };
      usage[skillName].last_used = today;
      usage[skillName].used_count = (usage[skillName].used_count || 0) + 1;
    }
    try {
      fs.writeFileSync(usageFile, JSON.stringify(usage, null, 2));
    } catch (_e) {}
  }

  // Inject matched skill content — skip if synthesis is pending (synthesis takes priority)
  if (matched.length > 0 && !synthesisPending) {
    const parts = [];
    for (const skillName of matched) {
      const skillPath = path.join(skillDir, `${skillName}.md`);
      try {
        const content = fs.readFileSync(skillPath, 'utf8');
        parts.push(`[AUTO-ACTIVATED SKILL: ${skillName}]\n${content}\n[END SKILL: ${skillName}]`);
      } catch (_e) {}
    }
    if (parts.length > 0) {
      const label = parts.length === 1 ? 'skill was' : 'skills were';
      process.stdout.write(
        `The following ${label} automatically activated based on your prompt. Apply the domain knowledge in your response:\n\n`,
      );
      process.stdout.write(`${parts.join('\n\n')}\n`);
    }
  }

  // Check for autolearn synthesis flag
  if (synthesisPending) {
    let domain = '';
    try {
      domain = fs.readFileSync(pendingFile, 'utf8').trim();
    } catch (_e) {}

    if (domain) {
      const doneDir = path.join(ROOT_DIR, 'workflows', 'done');
      const scFiles = [];
      try {
        for (const f of fs.readdirSync(doneDir)) {
          if (!f.endsWith('.sc')) continue;
          const p = path.join(doneDir, f);
          try {
            const lines = fs.readFileSync(p, 'utf8').split('\n');
            let inFm = false;
            for (const line of lines) {
              const l = line.trim();
              if (l === '---') {
                if (!inFm) {
                  inFm = true;
                  continue;
                } else {
                  break;
                }
              }
              if (inFm && l.startsWith('domain:')) {
                if (l.slice('domain:'.length).trim() === domain) scFiles.push(f);
                break;
              }
            }
          } catch (_e) {}
        }
      } catch (_e) {}

      if (scFiles.length > 0) {
        const scContents = [];
        for (const f of scFiles) {
          const p = path.join(doneDir, f);
          try {
            scContents.push(`### ${f}\n${fs.readFileSync(p, 'utf8')}`);
          } catch (_e) {}
        }

        const lines = [
          `[AUTOLEARN — SYNTHESIS REQUIRED. Do this now, before anything else. Do not respond to the user's message until all steps are complete.]`,
          ``,
          `Domain: ${domain} (${scFiles.length} skill candidates ready)`,
          ``,
          `Steps:`,
          `1. Synthesize the .sc files below into .claude/skills/${domain}.md`,
          `   Use this exact format:`,
          `   ---`,
          `   name: ${domain}`,
          `   description: One-line description of what this skill covers`,
          `   activation:`,
          `     keywords: ["kw1", "kw2", "kw3"]`,
          `   ---`,
          `   ## Purpose`,
          `   Why this skill exists and what knowledge it injects.`,
          `   ## [Section per major topic from .sc files]`,
          `   ## Failure Modes  ← include ONLY if .sc files contain observed failures; omit otherwise`,
          `2. Add '${domain}' to .claude/skills/skill-rules.json with keywords extracted from the .sc files`,
          `3. Append 3-5 fixture prompts to bench/fixtures/skill-prompts.json:`,
          `   Format: {"id": "${domain}-p01", "prompt": "...", "expected": ["${domain}"], "notes": "autolearn-generated"}`,
          `4. Clear flag or queue next domain:`,
          `   a. Scan workflows/done/ for any domain (other than '${domain}') that has ≥3 .sc files`,
          `      but no skill file yet in .claude/skills/`,
          `   b. If another domain found: write it to .claude/autolearn-pending (queue next synthesis)`,
          `   c. If none: delete .claude/autolearn-pending`,
          `5. Run: bash bench/run.sh --suite=02 — warn if precision drops >5pp vs previous run`,
          `6. Tell the user: 'Auto-generated skill: ${domain}' and confirm the regression result`,
          ``,
          `--- .sc file contents ---`,
          scContents.join('\n\n'),
          ``,
          `--- End Skill Candidates ---`,
        ];
        process.stdout.write(`${lines.join('\n')}\n`);
      }
    }
    // Do NOT clear the flag here. Claude clears it in step 4 of synthesis instructions.
  }

  process.exit(0);
});
