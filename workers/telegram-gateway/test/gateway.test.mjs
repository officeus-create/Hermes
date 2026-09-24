import test from "node:test";
import assert from "node:assert/strict";
import worker, { deliver, insideGroupWindow } from "../src/index.mjs";

class Db {
  rows = new Map();
  paused = 0;
  prepare(sql) {
    return {
      bind: (...args) => ({
        run: async () => {
          if (sql.includes("telegram_gateway_control")) { this.paused = args[0]; return { meta: { changes: 1 } }; }
          if (sql.startsWith("INSERT")) {
            const [id, kind, text, nonce] = args;
            if (this.rows.has(id)) return { meta: { changes: 0 } };
            this.rows.set(id, { id, kind, text, nonce, status: "pending" });
            return { meta: { changes: 1 } };
          }
          const row = this.rows.get(sql.includes("preview_message_id") ? args[1] : args.at(-1));
          if (row) {
            if (sql.includes("preview_message_id")) row.preview_message_id = args[0];
            if (sql.includes("status='sent'")) Object.assign(row, { status: "sent", telegram_message_id: args[0] });
            if (sql.includes("status='ambiguous'")) row.status = "ambiguous";
          }
          return { meta: { changes: Number(Boolean(row)) } };
        },
        first: async () => {
          if (sql.includes("reviewed_at")) {
            const [status, id, nonce, previewId] = args;
            const row = this.rows.get(id);
            if (!row || row.status !== "pending" || row.nonce !== nonce || row.preview_message_id !== previewId) return null;
            row.status = status;
            return { id };
          }
          if (sql.includes("status='sending'")) {
            const row = [...this.rows.values()].find(r => r.status === "approved" && r.kind === "client_progress");
            if (!row) return null;
            row.status = "sending";
            return { id: row.id, text: row.text };
          }
          throw Error("unexpected query");
        },
      }),
      first: async () => {
        if (sql.includes("telegram_gateway_control")) return { paused: this.paused };
        const row = [...this.rows.values()].find(r => r.status === "approved" && r.kind === "client_progress");
        if (!row) return null;
        row.status = "sending";
        return { id: row.id, text: row.text };
      },
    };
  }
}

const env = () => ({
  DB: new Db(), TELEGRAM_BOT_TOKEN: "test-token", TELEGRAM_WEBHOOK_SECRET: "hook-secret",
  PRODUCER_SECRET: "producer-secret", GROUP_CHAT_ID: "-100123456789", OWNER_USER_ID: "1234567",
  EXPECTED_BOT_USERNAME: "progressopro1_BOT", GROUP_PAUSED: "false", TELEGRAM_SEND_ENABLED: "true",
});
function mockTelegram({ failSend = false } = {}) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const method = String(url).split("/").at(-1);
    const body = JSON.parse(init.body);
    calls.push({ method, body });
    if (failSend && method === "sendMessage" && body.chat_id === "-100123456789") throw Error("timeout");
    const result = method === "getMe" ? { id: 55, username: "progressopro1_BOT" }
      : method === "getChatMember" ? { status: "administrator" }
      : method === "sendMessage" ? { message_id: 77, chat: { id: body.chat_id } } : true;
    return Response.json({ ok: true, result });
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}
const req = (path, body, headers = {}) => new Request(`https://example.test${path}`, {
  method: "POST", headers, body: JSON.stringify(body),
});
const proposal = { id: "client_progress_20260924", kind: "client_progress", text: "Kittle’s Garage: CRM demo ready; team QA pending." };
const noon = new Date("2026-09-24T16:00:00Z");

test("Chicago work window handles weekday, boundary and weekend", () => {
  assert.equal(insideGroupWindow(new Date("2026-09-24T13:59:00Z")), false);
  assert.equal(insideGroupWindow(new Date("2026-09-24T14:00:00Z")), true);
  assert.equal(insideGroupWindow(new Date("2026-09-24T22:45:00Z")), false);
  assert.equal(insideGroupWindow(new Date("2026-09-26T16:00:00Z")), false);
  assert.equal(insideGroupWindow(new Date("2026-01-05T15:00:00Z")), true);
});

test("proposal requires producer secret, rejects credentials and deduplicates", async () => {
  const e = env();
  const m = mockTelegram();
  try {
    assert.equal((await worker.fetch(req("/proposals", proposal), e)).status, 401);
    assert.equal((await worker.fetch(req("/proposals", { ...proposal, text: "password: 123" }, { Authorization: "Bearer producer-secret" }), e)).status, 400);
    const good = req("/proposals", proposal, { Authorization: "Bearer producer-secret" });
    assert.equal((await worker.fetch(good, e)).status, 202);
    assert.equal((await worker.fetch(req("/proposals", proposal, { Authorization: "Bearer producer-secret" }), e)).status, 409);
    assert.equal(m.calls.filter(c => c.method === "sendMessage").length, 1);
    assert.equal(e.DB.rows.get(proposal.id).status, "pending");
  } finally { m.restore(); }
});

test("owner-only approval, callback replay and exactly one group send", async () => {
  const e = env();
  const m = mockTelegram();
  try {
    await worker.fetch(req("/proposals", proposal, { Authorization: "Bearer producer-secret" }), e);
    const row = e.DB.rows.get(proposal.id);
    const callback = from => ({ callback_query: { id: "cb1", from: { id: from },
      message: { chat: { id: 1234567 }, message_id: 77 }, data: `a:${row.id}:${row.nonce}` } });
    assert.equal((await worker.fetch(req("/telegram/webhook", callback(1234567)), e)).status, 401);
    assert.equal((await worker.fetch(req("/telegram/webhook", callback(9), { "X-Telegram-Bot-Api-Secret-Token": "hook-secret" }), e)).status, 200);
    const approved = await worker.fetch(req("/telegram/webhook", callback(1234567), { "X-Telegram-Bot-Api-Secret-Token": "hook-secret" }), e);
    assert.equal((await approved.json()).changed, true);
    assert.equal((await (await worker.fetch(req("/telegram/webhook", callback(1234567), { "X-Telegram-Bot-Api-Secret-Token": "hook-secret" }), e)).json()).changed, false);
    assert.deepEqual(await deliver(e, noon), { id: row.id, message_id: 77 });
    assert.deepEqual(await deliver(e, noon), { empty: true });
    assert.equal(m.calls.filter(c => c.method === "sendMessage" && c.body.chat_id === e.GROUP_CHAT_ID).length, 1);
  } finally { m.restore(); }
});

test("pause and ambiguous delivery never replay", async () => {
  const e = env();
  const m = mockTelegram({ failSend: true });
  try {
    e.DB.rows.set(proposal.id, { ...proposal, status: "approved" });
    e.GROUP_PAUSED = "true";
    assert.deepEqual(await deliver(e, noon), { skipped: true });
    e.GROUP_PAUSED = "false";
    assert.deepEqual(await deliver(e, noon), { id: proposal.id, ambiguous: true });
    assert.equal(e.DB.rows.get(proposal.id).status, "ambiguous");
    assert.deepEqual(await deliver(e, noon), { empty: true });
    assert.equal(m.calls.filter(c => c.method === "sendMessage").length, 1);
  } finally { m.restore(); }
});

test("private owner command changes persistent pause; other users cannot resume", async () => {
  const e = env();
  const m = mockTelegram();
  const message = (id, text) => ({ message: { from: { id }, chat: { id, type: "private" }, text } });
  try {
    const header = { "X-Telegram-Bot-Api-Secret-Token": "hook-secret" };
    assert.equal((await worker.fetch(req("/telegram/webhook", message(1234567, "/pause"), header), e)).status, 200);
    assert.equal(e.DB.paused, 1);
    assert.deepEqual(await deliver(e, noon), { skipped: true });
    assert.equal((await worker.fetch(req("/telegram/webhook", message(9, "/resume"), header), e)).status, 200);
    assert.equal(e.DB.paused, 1);
    assert.equal((await worker.fetch(req("/telegram/webhook", message(1234567, "/resume"), header), e)).status, 200);
    assert.equal(e.DB.paused, 0);
  } finally { m.restore(); }
});
