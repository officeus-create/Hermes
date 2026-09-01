#!/usr/bin/env python3
"""Streaming redactor for Hermes Internal AI runner output.

This is a defense-in-depth boundary used only for browser-queued Internal AI
execution. It removes common credential-shaped values before FCC/Codex output
reaches the runner's event/evidence channel. The runner still applies its own
sanitizer before any server upload.
"""

from __future__ import annotations

import re
import sys

REDACTED = "[REDACTED]"

PRIVATE_KEY_BEGIN = re.compile(r"-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----")
PRIVATE_KEY_END = re.compile(r"-----END (?:[A-Z0-9 ]+ )?PRIVATE KEY-----")

SENSITIVE_ASSIGNMENT = re.compile(
    r"(?i)(?P<prefix>[\"']?(?:api[_-]?key|apikey|access[_-]?token|refresh[_-]?token|"
    r"auth[_-]?token|authorization|bearer[_-]?token|token|secret|client[_-]?secret|"
    r"password|passwd|cookie|session)[\"']?\s*[:=]\s*)(?P<quote>[\"']?)"
    r"(?P<value>[^\s,;&\"']{6,})(?P=quote)"
)

QUERY_SECRET = re.compile(
    r"(?i)(?P<prefix>[?&](?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|"
    r"signature|sig)=)(?P<value>[^&#\s]+)"
)

BEARER_TOKEN = re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{8,}")
JWT_TOKEN = re.compile(r"\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")
GITHUB_TOKEN = re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")
OPENAI_STYLE_KEY = re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b")
AWS_ACCESS_KEY = re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")


def redact_line(line: str) -> str:
    value = line.replace("\x00", "")
    value = QUERY_SECRET.sub(lambda match: f"{match.group('prefix')}{REDACTED}", value)
    value = SENSITIVE_ASSIGNMENT.sub(lambda match: f"{match.group('prefix')}{REDACTED}", value)
    value = BEARER_TOKEN.sub(f"Bearer {REDACTED}", value)
    value = JWT_TOKEN.sub("[REDACTED_JWT]", value)
    value = GITHUB_TOKEN.sub("[REDACTED_GITHUB_TOKEN]", value)
    value = OPENAI_STYLE_KEY.sub("[REDACTED_API_KEY]", value)
    value = AWS_ACCESS_KEY.sub("[REDACTED_AWS_ACCESS_KEY]", value)
    return value


def main() -> int:
    in_private_key = False
    for raw in sys.stdin:
        if in_private_key:
            if PRIVATE_KEY_END.search(raw):
                in_private_key = False
            continue
        if PRIVATE_KEY_BEGIN.search(raw):
            sys.stdout.write("[REDACTED_PRIVATE_KEY_BLOCK]\n")
            sys.stdout.flush()
            in_private_key = True
            continue
        sys.stdout.write(redact_line(raw))
        sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
