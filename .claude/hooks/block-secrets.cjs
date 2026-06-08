#!/usr/bin/env node
'use strict';
// block-secrets.js - PreToolUse hook for Bash commands
// Blocks commands that would expose secrets, credentials, or sensitive files.
//
// Reads tool input from stdin as JSON. Exits 2 to block, 0 to allow.

// Detect platform: running from .cursor/hooks/, .github/hooks/, or .claude/hooks/
const path = require('node:path');
const _hooksParent = path.basename(path.dirname(__dirname));
const isCursor = _hooksParent === '.cursor';
// Copilot behaves like claude-code for output format (plain text, not JSON)
// const isCopilot = _hooksParent === '.github';

function block(reason) {
  if (isCursor) {
    process.stdout.write(JSON.stringify({ permission: 'deny', user_message: reason }));
  } else {
    process.stdout.write(`${reason}\n`);
  }
  process.exit(2);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', () => {
  if (!input.trim()) process.exit(0);

  let command = '';
  try {
    const d = JSON.parse(input);
    const payload = d.tool_input || d;
    command = payload.command || '';
  } catch (_e) {
    process.exit(0);
  }

  if (!command) process.exit(0);

  // Safe .env suffixes: template/example/schema files are not secrets
  if (/\.env\.(example|sample|template|schema|type|dist|template\.local)/i.test(command)) {
    process.exit(0);
  }

  const BLOCKED_PATTERNS = [
    [/cat.*\.env/i, 'cat.*\\.env'],
    [/cat.*credentials/i, 'cat.*credentials'],
    [/cat.*\.pem/i, 'cat.*\\.pem'],
    [/cat.*\.key/i, 'cat.*\\.key'],
    [/cat.*secret/i, 'cat.*secret'],
    [/echo.*\$.*PASSWORD/i, 'echo.*\\$.*PASSWORD'],
    [/echo.*\$.*SECRET/i, 'echo.*\\$.*SECRET'],
    [/echo.*\$.*TOKEN/i, 'echo.*\\$.*TOKEN'],
    [/echo.*\$.*API_KEY/i, 'echo.*\\$.*API_KEY'],
    [/printenv/i, 'printenv'],
    [/^env$/, '^env$'],
    [/cat.*\/etc\/shadow/i, 'cat.*/etc/shadow'],
    [/cat.*\/etc\/passwd/i, 'cat.*/etc/passwd'],
    [/cat.*id_rsa/i, 'cat.*id_rsa'],
    [/cat.*id_ed25519/i, 'cat.*id_ed25519'],
    [/base64.*\.env/i, 'base64.*\\.env'],
    [/base64.*\.pem/i, 'base64.*\\.pem'],
    [/base64.*\.key/i, 'base64.*\\.key'],
    [/curl.*-d.*password/i, 'curl.*-d.*password'],
    [/curl.*-d.*secret/i, 'curl.*-d.*secret'],
    [/curl.*-d.*token/i, 'curl.*-d.*token'],
  ];

  for (const [re, label] of BLOCKED_PATTERNS) {
    if (re.test(command)) {
      block(
        `BLOCKED: Command appears to access secrets or credentials. Pattern matched: ${label}. If intentional, run the command manually outside the AI assistant.`,
      );
    }
  }

  const COMMIT_SECRET_PATTERNS = [
    [/git add.*\.env/i, 'git add.*\\.env'],
    [/git add.*credentials/i, 'git add.*credentials'],
    [/git add.*\.pem/i, 'git add.*\\.pem'],
    [/git add.*\.key/i, 'git add.*\\.key'],
    [/git add -A/i, 'git add -A'],
    [/git add \.\s*$/, 'git add .'],
  ];

  for (const [re, label] of COMMIT_SECRET_PATTERNS) {
    if (re.test(command)) {
      block(
        `BLOCKED: Command may stage secret files. Pattern matched: ${label}. Use specific file names with git add instead.`,
      );
    }
  }

  process.exit(0);
});
