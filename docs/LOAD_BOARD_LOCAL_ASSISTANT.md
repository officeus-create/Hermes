# Load Board local assistants

Two bounded dispatcher helpers reuse an already installed Ollama model. No model download,
cloud-provider fallback, credentials, publishing, load booking, or permanent background daemon.
The Free Claude Code Admin model list can show the same installed Ollama provider; this helper
calls loopback Ollama directly and does not change the admin panel or its provider configuration.

## Commands

```bash
printf '%s' 'Sanitized load text' | python3 scripts/ai/load-board-local-assistant.py extract
printf '%s' 'Sanitized proposed dispatch plan' | python3 scripts/ai/load-board-local-assistant.py review
python3 scripts/ai/load-board-local-assistant.test.py
```

`extract` returns source-grounded route, equipment, quoted payment, timing, commodity and weight.
Unknowns remain null. Weight must be explicitly quoted in pounds; no silent kilogram conversion.
`review` identifies missing permission, freshness, expiry, economic assumptions and next steps.
Both always return `draft_requires_human_review`, never live inventory or an operational approval.

Requirements: Python 3.9+, running local Ollama at 127.0.0.1:11434 and installed
qwen2.5-coder:3b. Input is limited to 16,000 bytes. Redirects and environment proxies are disabled.
Credentials in input are rejected. Output is parsed and validated; availability never derives
from model output. These are assistants for an operator, not autonomous dispatch agents.

## Execution evidence, 2026-09-12

A local illustrative extraction returned Chicago, IL -> Dallas, TX; dry_van; $2,100;
25,000 lbs; and the stated pickup/delivery windows. This was a labeled synthetic test,
not a posted load. A local review also identified the missing pickup date, redistribution permission, deadhead
and load reconfirmation, and recommended not booking/publishing. Eight deterministic
contracts passed. The contracts test grounded values, invented geography,
unsupported rate/weight evidence, invalid schemas, nonfinite numbers, and credential rejection.

Before publishing any record: confirm source rights, visibility, absolute dates, expiry,
vehicle/equipment fit, source identity, and operator approval. Never count helper drafts
or training examples as available loads. No private account, contact, message or credential
is included in this document or its tests.
