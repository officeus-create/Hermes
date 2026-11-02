#!/usr/bin/env python3
"""Deterministic first-line policy router for high-risk VIKTOR decisions.

The local model may explain a decision, but it cannot override these fail-closed
rules.  This follows the Hermes zero-cost execution ladder: deterministic rules
before free/local semantic inference.
"""

from __future__ import annotations

import re


RULES = (
    (
        "BLOCK_OUTBOUND",
        (
            r"запрещает.*писать|без отдельного разрешения",
            r"threads.*(?:нет|не имеет).*(?:oauth|scope)|опубликовать.*от имени компании",
        ),
        "External/provider communication requires an explicit current owner and account permission gate.",
    ),
    (
        "REUSE_EXISTING_HAE",
        (r"отдельн.*cron|втор.*one brain|втор.*(?:queue|sql)|действующ.*hae",),
        "The existing Cloudflare HAE remains the single scheduler, Queue and D1 control plane.",
    ),
    (
        "READ_ONLY_CHECK",
        (r"уже принял.*отправ|повторн.*отправ.*дубл|получател.*не подтверд",),
        "An ambiguous prior side effect must be reconciled by readback, never replayed blindly.",
    ),
    (
        "HOLD_RELEASE",
        (
            r"предыдущ.*commit sha|текущ.*ветк.*нов",
            r"две активн.*ветк.*один.*файл|writer lease.*не согласован|третью реализац",
        ),
        "Release or a competing writer is blocked until exact-head and ownership gates agree.",
    ),
    (
        "RECHECK_ACCESS",
        (r"\b403\b|доступ.*scope|scope.*не провер",),
        "An access failure is UNKNOWN data, not proof that the records do not exist.",
    ),
    (
        "STOP_REAUDIT",
        (r"два последовательн.*аудит|повторить трет",),
        "Unchanged evidence must not generate an endless duplicate audit loop.",
    ),
    (
        "NOT_FOUND_IN_WINDOW",
        (r"newer_than|фильтр.*вернул ноль|полный поиск.*не выполня",),
        "A bounded query proves only absence inside that bounded window.",
    ),
    (
        "NOT_RUN",
        (r"тестов.*нет вывода|тестов.*runner|runner.*тест|exit code",),
        "A written test is not an executed test without a runner receipt.",
    ),
    (
        "EXCLUDE_SYNTHETIC",
        (r"qa-скрипт|test@example\.com|синтетич.*лид",),
        "Synthetic QA records cannot be counted as real business outcomes.",
    ),
    (
        "INDEXING_UNKNOWN",
        (r"sitemap|search console.*принял|http 200.*индекс|exact url.*отсутств",),
        "Public rendering and sitemap acceptance do not prove exact-URL indexation.",
    ),
    (
        "BUSINESS_RESULT_UNKNOWN",
        (r"просмотр.*(?:qualified leads|клиент|платеж)|лиды.*не измер",),
        "Attention metrics do not prove qualified demand, customers or revenue.",
    ),
    (
        "SUPERSEDED_HISTORICAL",
        (r"старый документ.*mac|более поздн.*решен|как трактовать стар",),
        "Later owner-approved truth supersedes an older instruction while preserving history.",
    ),
    (
        "REUSE_EXISTING",
        (r"уже существует issue|тот же дефект|открыть ещё один issue",),
        "Reuse the canonical issue when cause and evidence are unchanged.",
    ),
    (
        "PLAN_ONLY",
        (
            r"подробн.*план|тест-кейсы.*не запуск|runtime не менял",
            r"файл закрытого экзамена отсутств|самостоятельно придумать.*вопрос.*ответ",
        ),
        "A proposal or writer-authored exam is implementation planning, not independent evidence.",
    ),
    (
        "HYPOTHESIS_UNVERIFIED",
        (r"предложена причина|нет сравнения|контрольн.*групп|кауз",),
        "A causal explanation needs comparative evidence and a reproducible test.",
    ),
    (
        "NOT_LIVE_VERIFIED",
        (
            r"workflow.*merge.*зел|production sha.*отсутств|provider readback.*отсутств",
            r"pull request закрыт.*merged|старые зелёные workflow",
        ),
        "Source/CI/merge state does not prove the current production runtime.",
    ),
)


def classify(question: str) -> dict:
    text = " ".join(str(question).lower().split())
    # PLAN_ONLY takes precedence when the artifact is explicitly a plan/test-plan
    # and no execution occurred. This prevents the generic NOT_RUN rule from
    # collapsing "planned but not executed" into "test execution unknown".
    plan_only_patterns = (
        r"подробн.*план.*(?:не запуск|runtime не менял)",
        r"тест-план.*(?:не запуск|никто.*не запуск)",
        r"тест-кейсы.*не запуск",
        r"файл закрытого экзамена отсутств|самостоятельно придумать.*вопрос.*ответ",
    )
    if any(re.search(pattern, text, re.IGNORECASE) for pattern in plan_only_patterns):
        return {
            "decision": "PLAN_ONLY",
            "confidence": "HIGH",
            "matched_rule": "PLAN_ONLY_PRECEDENCE",
            "matched_pattern_count": 1,
            "rationale": "A proposal, migration plan or test-plan without execution is planning evidence, not an executed test result.",
            "semantic_model_required": False,
        }
    for decision, patterns, rationale in RULES:
        matched = [pattern for pattern in patterns if re.search(pattern, text, re.IGNORECASE)]
        if matched:
            return {
                "decision": decision,
                "confidence": "HIGH",
                "matched_rule": decision,
                "matched_pattern_count": len(matched),
                "rationale": rationale,
                "semantic_model_required": False,
            }
    return {
        "decision": "SOURCE_UNAVAILABLE",
        "confidence": "LOW",
        "matched_rule": None,
        "matched_pattern_count": 0,
        "rationale": "No deterministic policy rule matched; require bounded local semantic review and independent evidence.",
        "semantic_model_required": True,
    }


def resolve_decision(question: str, model_decision: str, allowed_decisions) -> dict:
    policy = classify(question)
    allowed = {str(value) for value in allowed_decisions}
    if not policy["semantic_model_required"] and policy["decision"] in allowed:
        return {
            **policy,
            "model_decision": str(model_decision),
            "decision_source": "DETERMINISTIC_POLICY",
        }
    return {
        **policy,
        "decision": str(model_decision),
        "model_decision": str(model_decision),
        "decision_source": "LOCAL_MODEL",
    }
