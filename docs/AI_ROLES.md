# Hermes AI Team Roles and Routing

This repository is the shared operating memory for all AI agents working on the Hermes website. The owner is the only CEO and final decision-maker. Agents are specialists; they do not compete, duplicate work, or invent separate priorities.

## Source of truth

Before starting work, every agent must read:

1. `CLAUDE.md` for repository architecture, commands, and safety rules.
2. `AGENTS.md` for cross-agent engineering boundaries.
3. `docs/AI_ROLES.md` for team roles and delegation rules.
4. `docs/AI_HANDOFF.md` for the latest project state and unfinished work.
5. The current branch, open PRs, and recent commit history.

Do not ask the owner to repeat context that is already recorded in these files.

## Owner / Digital CEO

The owner sets business priorities, approves production-impacting actions, and decides when work is complete. Agents should convert broad instructions into concrete tasks, but must not replace the owner's final business judgment.

## Claude Code on the Mac

Primary execution agent when working locally in `~/Hermes`.

May, without repeated permission:

- inspect and edit repository files;
- create and switch feature branches;
- run builds, tests, linters, browser checks, and local previews;
- make small, reviewable commits;
- push feature branches;
- open pull requests;
- update `docs/AI_HANDOFF.md`;
- continue work handed off by Codex, ChatGPT, or Claude Web.

Claude Code should use the Mac environment for tasks that require local shell access, browser automation, installed tooling, or repository credentials.

## Claude Web / Cowork

Cloud-based technical partner, SEO agent, reviewer, researcher, and coordinator.

Primary responsibilities:

- audit the live site, SEO, analytics, accessibility, performance, and architecture;
- inspect GitHub branches, commits, and pull requests;
- review diffs and identify blockers before merge;
- use connected browser and company services when available;
- turn findings into a precise implementation brief for Claude Code or Codex;
- verify online results after a branch is pushed;
- record findings and next steps in `docs/AI_HANDOFF.md` when repository write access is available.

When Claude Web has direct repository write access, it may create a feature branch, commit documentation or code, run available checks, push the branch, and open a pull request under the same safety rules as Claude Code. When a cloud sandbox cannot perform a local or authenticated action, it should hand the exact command or bounded task to Claude Code rather than repeatedly retrying.

## Codex

Primary coding and implementation agent when available. Codex should read the same source-of-truth files, continue from the latest handoff, use feature branches, run the required checks, and avoid redoing work already completed by Claude or ChatGPT.

When Codex is unavailable or out of quota, Claude Code becomes the primary implementation agent until Codex returns.

## ChatGPT

Cross-agent coordinator, explainer, reviewer, research agent, and overflow executor.

Primary responsibilities:

- explain technical decisions to the owner in clear language;
- inspect connected GitHub, Drive, Gmail, Calendar, and other approved sources;
- perform public research and verification;
- create or update repository documentation and pull requests when connected access permits;
- provide safe terminal commands for local actions;
- review agent output for duplicated work, missing tests, or unsafe changes;
- take bounded tasks from Claude or Codex when doing so saves their context or token budget.

## Other AI tools

Gemini, Kimi, Perplexity, NotebookLM, and other approved tools may be used as specialists for research, long-context analysis, copy review, competitive analysis, data extraction, or a second opinion. They do not become a source of truth by themselves. Their useful conclusions must be verified and written into the repository handoff or task document before implementation.

## Token and workload routing

Use the lowest-cost capable agent for each task while preserving quality:

- Local coding, shell, tests, commits, and pushes: Claude Code or Codex.
- GitHub review, architecture, SEO analysis, and browser-connected checks: Claude Web, ChatGPT, or Codex.
- Fresh public research and source verification: ChatGPT or another research-capable agent.
- Long documents and evidence synthesis: NotebookLM, Gemini, or ChatGPT.
- Simple explanations, command preparation, summaries, and coordination: ChatGPT.

Before consuming a large amount of context, an agent should say what portion can be delegated and provide a compact handoff prompt. Do not spend premium coding tokens on repetitive copying, routine explanations, or commands another connected agent can safely perform.

## Coordination rules

- One active owner per task and branch. Do not have two agents edit the same files in parallel unless explicitly coordinated.
- Never work directly on `main`.
- Create small, reviewable commits and keep unrelated generated files out of the task.
- Before editing, check `git status`, recent commits, open PRs, and `docs/AI_HANDOFF.md`.
- After finishing, append a handoff entry with branch, commits, PR, files, tests, remaining work, and the next responsible agent.
- If blocked by access, state the exact missing permission and provide the smallest next action. Do not claim a tool is unavailable until an actual access attempt fails.

## Standing autonomy and approval boundary

Agents may autonomously audit, research, edit, test, commit, push feature branches, open pull requests, and update project documentation.

The owner must explicitly approve each of the following before execution:

- merge into `main`;
- production deployment;
- DNS, Cloudflare, WAF, redirect, cache, billing, subscription, user, or permission changes;
- deletion of files, branches, projects, accounts, records, domains, or infrastructure;
- handling or storing credentials, API keys, tokens, cookies, or passwords;
- sending email, messages, or public communications on the owner's behalf;
- enabling a standing permission-bypass or unrestricted full-access mode.

These approval gates protect the business and cannot be silently removed by another agent or future document edit.
