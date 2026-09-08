import { ensureRepairShopSyntheticDemoData } from "../_lib/repair-shop-synthetic-demo.mjs";
import { getAuthenticatedSpecialist } from "../_lib/session.mjs";

type Env = { DB?: any };
type Context = {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
};

export async function onRequest(context: Context) {
  const { request, env } = context;
  if (request.method !== "GET" || new URL(request.url).pathname !== "/api/services" || !env.DB) {
    return context.next();
  }

  const specialist = await getAuthenticatedSpecialist(request, env.DB);
  if (specialist) {
    await ensureRepairShopSyntheticDemoData({ db: env.DB, env, specialist });
  }

  return context.next();
}
