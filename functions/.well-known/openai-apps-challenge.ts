type Env = { OPENAI_APPS_CHALLENGE_TOKEN?: string };
type Context = { env: Env };

const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function onRequestGet({ env }: Context) {
  const token = String(env.OPENAI_APPS_CHALLENGE_TOKEN || "").trim();
  if (!token) return new Response("Not configured", { status: 404, headers });
  return new Response(token, { status: 200, headers });
}

export async function onRequest() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { ...headers, Allow: "GET" },
  });
}
