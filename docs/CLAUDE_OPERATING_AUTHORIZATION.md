# Claude Operating Authorization for Hermes

## Purpose

This document records the owner's standing authorization for the Claude agent operating on the Hermes project. It is intended to reduce repetitive confirmation requests for ordinary, reversible, branch-based work while preserving explicit approval gates for high-risk actions.

## Authorized working environments

Claude may use whichever already-connected environment is best suited to the task:

- Claude Code on the owner's Mac;
- Claude Desktop / Cowork;
- Claude in Chrome;
- Control Chrome;
- Control your Mac;
- GitHub Integration;
- Google Drive and other already-connected company tools;
- the local Hermes repository at `/Users/progressopro/Hermes`;
- the GitHub repository `officeus-create/Hermes`.

When an action requires persistent files, Git history, push, PR creation, or local tests, Claude should prefer the real Mac/local repository or GitHub Integration over a temporary container.

## Standing authorization

Claude may perform the following without asking the owner again each time:

- inspect the codebase, website, connected documents, open PRs, issues, branches, commits, CI results, Search Console, GA4, and available company systems;
- read the work completed by Codex, ChatGPT, previous Claude sessions, and other approved agents;
- continue from the current project state rather than restarting analysis;
- create feature branches;
- edit source code, tests, content, configuration, and project documentation in feature branches;
- run builds, static checks, unit tests, browser tests, preview servers, and non-destructive diagnostic commands;
- fix failures and iterate until the branch is coherent;
- commit changes;
- push feature branches;
- open and update Pull Requests;
- update `docs/AI_HANDOFF.md`;
- create or update GitHub issues and task queues;
- use Claude in Chrome for navigation, verification, and non-destructive browser work;
- use already-connected Google Drive files and project sources for cross-reference;
- prepare delegation briefs for ChatGPT, Codex, Gemini, NotebookLM, Kimi, Perplexity, or another approved agent;
- delegate repetitive research, categorization, drafting, summarization, source collection, and documentation tasks when this preserves Claude's context for architecture, implementation, debugging, and review;
- proceed through the next safe, unblocked task when the owner says "continue," "do everything at your discretion," or equivalent.

## Required startup routine

Before implementation work, Claude should check:

1. the current environment and whether it is persistent or temporary;
2. `git status`, current branch, remotes, and recent commits when local Git is available;
3. open PRs and CI status;
4. `CLAUDE.md`;
5. `AGENTS.md`;
6. `docs/AI_ROLES.md`;
7. the latest entries in `docs/AI_HANDOFF.md`;
8. active GitHub issues and the relevant roadmap;
9. whether another agent is editing the same files or branch.

## Continuation loop

For ordinary branch-based work, Claude should follow this loop without repeatedly asking whether to continue:

1. identify the next safe, unblocked task;
2. choose the correct environment;
3. create or use a dedicated feature branch;
4. implement the smallest coherent slice;
5. run the relevant verification suite;
6. fix failures;
7. commit and push;
8. open or update a PR;
9. update the handoff log;
10. create delegation briefs for remaining simple tasks;
11. continue to the next non-overlapping safe task.

If a system permission prompt cannot be avoided, Claude should continue all other available work and batch the remaining required approvals into one concise message instead of interrupting the owner repeatedly.

## Token and workload routing

Claude should reserve premium context for:

- architecture;
- complex coding;
- debugging;
- SEO strategy;
- ambiguous technical decisions;
- final review of other agents' work;
- browser-connected verification that requires judgment.

Claude should delegate or hand off lower-cost work such as:

- bulk FAQ extraction;
- keyword grouping;
- competitor source collection;
- formatting and documentation cleanup;
- repetitive content classification;
- status summaries;
- routine cross-checks that another connected agent can perform accurately.

Every delegation brief should include:

- objective;
- source files or URLs;
- constraints;
- exact output;
- verification criteria;
- destination file, branch, issue, or PR.

## Shared memory rule

Claude must use GitHub as the persistent source of truth. Decisions and completed work should be recorded in:

- commits;
- PR descriptions and comments;
- GitHub issues;
- `docs/AI_HANDOFF.md`;
- roadmap and task documents.

Do not rely on a temporary container or chat history as the sole location of valuable work. If work begins in a temporary environment, export the patch, file list, commit diff, or full content to a persistent company-controlled location before the session ends.

## Approval gates that remain in force

The following still require explicit owner confirmation for the specific action:

- merging a PR into `main`;
- production deployment;
- DNS changes;
- Cloudflare, WAF, cache, redirect, account, billing, user, or permission changes;
- destructive deletion of files, branches, projects, data, accounts, domains, databases, or KV records;
- creating, rotating, storing, or exposing credentials, passwords, cookies, tokens, or API keys;
- sending email, Telegram, social posts, or other external communications on the owner's behalf;
- irreversible or materially risky business decisions;
- publishing unsupported claims about employment, income, results, scale, or guarantees.

The owner may choose to provide credentials through approved secure tooling, but they must not be committed to GitHub, embedded in remote URLs, copied into project documentation, or exposed in ordinary chat logs.

## Agent parity objective

Claude should aim for functional parity with Codex and ChatGPT where the connected environment permits it:

- read and understand their completed work;
- continue or improve it;
- verify it independently;
- leave clear handoffs for the next agent;
- avoid duplicate effort;
- use the best available tool for each subtask.

Product-level differences between Claude, Codex, and ChatGPT may still exist. When a capability is unavailable in the current session, Claude should use another connected environment or create a precise handoff rather than asking the owner to manually repeat work that another agent can perform.
