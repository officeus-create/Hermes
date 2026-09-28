export type ThreadsReplyAction = "reply" | "skip" | "review";

export type ThreadsAiDecision = {
  action: ThreadsReplyAction;
  reply: string;
  intent: string;
  reason: string;
};

const MAX_REPLY_CHARS = 420;
const blockedAutoReplyPattern =
  /\b(?:lawsuit|lawyer|attorney|legal action|subpoena|refund dispute|chargeback|fraud|scam|harassment|threat|suicide|self-harm|medical emergency|diagnosis|prescription|password|api key|access token|credit card|bank account|routing number)\b/i;
const commercialIntentPattern =
  /\b(?:crm|website|seo|geo|google maps|automation|marketing|leads?|sales|price|pricing|cost|quote|demo|trial|interested|how does it work|how much|business system)\b/i;

export function normalizeThreadsText(value: unknown, max = 1200): string {
  return typeof value === "string"
    ? value.replace(/[<>\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

export function deterministicReplyGate(text: unknown): ThreadsReplyAction {
  const normalized = normalizeThreadsText(text);
  if (!normalized || normalized.length < 2) return "skip";
  if (blockedAutoReplyPattern.test(normalized)) return "review";
  return "reply";
}

export function hasCommercialIntent(text: unknown): boolean {
  return commercialIntentPattern.test(normalizeThreadsText(text));
}

export function buildThreadsReplyPrompt(comment: string, context: { postText?: string; username?: string } = {}) {
  const cleanComment = normalizeThreadsText(comment);
  const postText = normalizeThreadsText(context.postText, 900);
  const username = normalizeThreadsText(context.username, 120);
  return [
    "You are the ProgressoPro/Hermes Technology Threads community manager.",
    "Write one concise, natural reply in the SAME LANGUAGE as the comment.",
    "Goal: continue a useful business conversation, not to sound like a bot and not to force a sale.",
    "Be specific. Add one useful point, example, or question. Ask at most one question.",
    "Never promise rankings, views, leads, revenue, savings, timelines, or results you cannot verify.",
    "Do not invent customer outcomes, prices, integrations, or capabilities.",
    "Do not claim the commenter is a lead. Do not mention AI or automation unless it is relevant to their message.",
    "If there is clear commercial intent, you may softly mention that we can look at their workflow/business and suggest a next step.",
    "Return ONLY JSON: {\"action\":\"reply|skip|review\",\"reply\":\"...\",\"intent\":\"...\",\"reason\":\"...\"}.",
    username ? `Commenter: @${username}` : "",
    postText ? `Our post: ${postText}` : "",
    `Comment: ${cleanComment}`,
  ].filter(Boolean).join("\n");
}

export function parseThreadsAiDecision(value: unknown): ThreadsAiDecision {
  let parsed: any = value;
  if (typeof value === "string") {
    const text = value.trim().replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/, "");
    parsed = JSON.parse(text);
  }
  const action = parsed?.action === "reply" || parsed?.action === "skip" || parsed?.action === "review"
    ? parsed.action
    : "review";
  const reply = normalizeThreadsText(parsed?.reply, MAX_REPLY_CHARS);
  const intent = normalizeThreadsText(parsed?.intent, 120);
  const reason = normalizeThreadsText(parsed?.reason, 300);
  if (action === "reply" && !reply) return { action: "review", reply: "", intent, reason: "AI returned an empty reply." };
  if (blockedAutoReplyPattern.test(reply)) {
    return { action: "review", reply, intent, reason: "Generated reply contains a sensitive escalation term." };
  }
  return { action, reply, intent, reason };
}

export function extractResponsesText(payload: any): string {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const parts: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

export function buildTrackedThreadsUrl(path = "/paths/technology/", contentId = "threads-growth") {
  const url = new URL(path, "https://hermeslogisticsus.com");
  url.searchParams.set("utm_source", "threads");
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", "marketing_insights");
  url.searchParams.set("utm_content", normalizeThreadsText(contentId, 64).toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "threads-growth");
  return url.toString();
}
