#!/usr/bin/env node
// Generate a least-privilege permission set for the MiniMax Code runtime on the owner Mac.
//
// Why this exists: the owner granted broad local access on 2026-11-06, and an independent audit
// flagged that "allow everything" removes the distinction between harmless local work and
// irreversible or externally visible actions. This generator keeps the frictionless part
// (read, test, isolated development, delegated free lanes) automatic and puts the sensitive
// categories behind an explicit gate.
//
// Scope: local shell and file access on this machine. It does not touch the repository, Drive,
// Cloudflare, DNS, billing, GitHub merge rights or any external system.
//
// Usage:
//   node scripts/ai/local-permissions.mjs            # print JSON
//   node scripts/ai/local-permissions.mjs --write    # write ~/.minimax/permission.json
//
// Revert: restore ~/.minimax/permission.json.bak-<stamp> (pre-grant snapshot), or delete the
// generated file to fall back to runtime defaults.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ALLOW_READ_ROOTS = [
  '/Users/a1/Documents',
  '/Users/a1/Downloads',
  '/Users/a1/Desktop',
  '/Users/a1/.minimax',
  '/Users/a1/.claude',
  '/Users/a1/.codex',
  '/Users/a1/.local',
  '/tmp',
];

const ALLOW_WRITE_ROOTS = [
  '/Users/a1/Documents',
  '/tmp',
  '/Users/a1/.minimax',
  '/Users/a1/.claude/skills',
  '/Users/a1/.minimax/skills',
];

// Read-only and development shell commands that may run without a prompt.
const ALLOW_COMMANDS = [
  'ls', 'cat', 'head', 'tail', 'wc', 'grep', 'rg', 'find', 'pwd', 'which', 'echo', 'date',
  'stat', 'file', 'du', 'df', 'diff', 'tree', 'sed -n', 'sort', 'uniq', 'jq', 'curl',
  'git status', 'git log', 'git diff', 'git show', 'git branch', 'git remote', 'git fetch',
  'git stash list', 'git worktree list', 'git rev-parse', 'git ls-files', 'git blame',
  'npm', 'npx', 'node', 'python3', 'pytest', 'pnpm', 'yarn', 'tsc', 'eslint', 'prettier',
  'vitest', 'playwright', 'astro', 'mcp', 'codex', 'claude', 'gemini', 'ollama',
  'rclone lsd', 'rclone ls', 'rclone cat', 'rclone about', 'rclone listremotes',
  'rclone copy', 'rclone size', 'mcode-tools connector tools', 'mcode-tools connector tool',
  'mcode-tools connector call',
];

// Shell patterns that must always be confirmed by the owner first.
const ASK_COMMANDS = [
  'rm', 'chmod', 'chown', 'xattr', 'sudo', 'launchctl', 'kill', 'pkill',
  'defaults write', 'security', 'dscl', 'csrutil', 'spctl', 'nvram',
  'git push --force', 'git reset --hard', 'git clean', 'git checkout --',
  'npm publish', 'brew',
  'curl -X POST', 'curl -X PUT', 'curl -X DELETE', 'curl -T', 'scp', 'rsync',
  'mcode-tools connector call connector__github__merge_pull_request',
  'mcode-tools connector call connector__github__create_pull_request',
];

// Credential material the agent must never read directly. The owning tools read their own
// credentials at runtime; the agent does not need to see them.
const DENY_PATHS = [
  '/Users/a1/.ssh',
  '/Users/a1/.aws',
  '/Users/a1/.config/rclone',
  '/Users/a1/.fcc/auth',
  '/Users/a1/.claude/.credentials.json',
  '/Users/a1/.codex/auth.json',
  '/Users/a1/.minimax/auth',
  '/Users/a1/Library/Keychains',
];

const cmd = (tool_name, pattern) => ({ tool_name, matcher: { kind: 'command', pattern } });
const pathRule = (tool_name, pattern, actions) => ({
  tool_name,
  matcher: { kind: 'path', pattern, actions },
});

const allow = [];
for (const c of ALLOW_COMMANDS) allow.push(cmd('bash', `${c}:*`));
for (const p of ALLOW_READ_ROOTS) {
  allow.push(pathRule('read', `${p}/**`, ['read']));
  allow.push(pathRule('glob', `${p}/**`, ['read']));
  allow.push(pathRule('grep', `${p}/**`, ['read']));
  allow.push(pathRule('bash', `${p}/**`, ['read']));
}
for (const p of ALLOW_WRITE_ROOTS) {
  allow.push(pathRule('write', `${p}/**`, ['write']));
  allow.push(pathRule('edit', `${p}/**`, ['write']));
}

const ask = ASK_COMMANDS.map((c) => cmd('bash', `${c}:*`));

const deny = [];
for (const p of DENY_PATHS) {
  deny.push(pathRule('read', `${p}/**`, ['read']));
  deny.push(pathRule('bash', `${p}/**`, ['read']));
  deny.push(pathRule('glob', `${p}/**`, ['read']));
  deny.push(pathRule('grep', `${p}/**`, ['read']));
}

const payload = { version: 2, allow, deny, ask };
const out = `${JSON.stringify(payload, null, 2)}\n`;

if (process.argv.includes('--write')) {
  const target = join(homedir(), '.minimax', 'permission.json');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backup = `${target}.bak-${stamp}`;
  if (existsSync(target)) {
    writeFileSync(backup, readFileSync(target), { mode: 0o600 });
    console.error(`previous rules saved: ${backup}`);
  }
  writeFileSync(target, out, { mode: 0o600 });
  console.error(`written: ${target}`);
  console.error(`allow=${allow.length} ask=${ask.length} deny=${deny.length}`);
} else {
  process.stdout.write(out);
}
