import assert from "node:assert/strict";
import {
  buildThreadsReplyPrompt,
  buildTrackedThreadsUrl,
  deterministicReplyGate,
  extractResponsesText,
  hasCommercialIntent,
  parseThreadsAiDecision,
} from "../src/lib/threads-growth-engine.ts";

assert.equal(deterministicReplyGate("How much does your CRM cost?"), "reply");
assert.equal(deterministicReplyGate("I am sending my API key"), "review");
assert.equal(deterministicReplyGate("   "), "skip");

assert.equal(hasCommercialIntent("Do you build CRM systems for repair shops?"), true);
assert.equal(hasCommercialIntent("Nice post"), false);

const prompt = buildThreadsReplyPrompt("Сколько стоит CRM?", {
  postText: "We build CRM around business processes.",
  username: "owner",
});
assert.match(prompt, /SAME LANGUAGE/);
assert.match(prompt, /Сколько стоит CRM/);
assert.match(prompt, /Never promise/);

const decision = parseThreadsAiDecision(JSON.stringify({
  action: "reply",
  reply: "Можно начать с описания ваших процессов. Какая часть бизнеса сейчас отнимает больше всего ручного времени?",
  intent: "crm_interest",
  reason: "Commercial question",
}));
assert.equal(decision.action, "reply");
assert.match(decision.reply, /процессов/);

assert.equal(
  extractResponsesText({ output: [{ content: [{ text: "{\"action\":\"skip\",\"reply\":\"\",\"intent\":\"\",\"reason\":\"spam\"}" }] }] }),
  "{\"action\":\"skip\",\"reply\":\"\",\"intent\":\"\",\"reason\":\"spam\"}"
);

const tracked = new URL(buildTrackedThreadsUrl("/paths/technology/", "CRM Reply Test"));
assert.equal(tracked.hostname, "hermeslogisticsus.com");
assert.equal(tracked.searchParams.get("utm_source"), "threads");
assert.equal(tracked.searchParams.get("utm_content"), "crm-reply-test");

console.log("threads growth engine contract: ok");
