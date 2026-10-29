# AI Contribution Identity

```yaml
ai_name:
model:
chat_or_thread:
role:
department:
date:
contribution_type: Proposal | Review | Decision | Implementation Report | Measurement Report
confidence: 0
specialization:
  -
not_specialized_in:
  -
reviewed:
  -
not_reviewed:
  -
```

## Scope statement

- **What I am responsible for in this contribution:**
- **What I am not deciding:**
- **Assumptions:**
- **Information still required:**

## Agent Work Passport — compact GitHub PR/handoff signature

Use the mandatory opening identity block above for substantive proposals. For a PR, meaningful comment or handoff, copy this compact passport instead (full rules: `ai-collaboration/00_READ_FIRST/AI_COLLABORATION_PROTOCOL.md`):

```text
AGENT WORK PASSPORT
Agent / environment:
Contributor: (actual implementer; NONE for review only)
Chat / session: (exact title if known; otherwise UNAVAILABLE)
Work ID: (existing GitHub issue/PR/task)
Role / department:
Action & scope: (including changed files)
Status:
Evidence: (commit SHA / PR / exact-head CI / production receipt)
Overlap / dependencies:
Next owner & action:
Owner approval required:
```

Do not invent chat titles, attribute code to a reviewing AI, claim deployment from green CI or paste private chats into GitHub.
