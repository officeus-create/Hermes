const CONTRACT_ROUTE = "/api/carrier-contract";
const LIVE_CONTRACT = Object.freeze({
  CARRIER_CONTRACT_MODE: "live",
  CARRIER_CONTRACT_APPROVED_VERSION: "HERMES-CARRIER-EXECUTION-V2026-08-06",
  CARRIER_CONTRACT_APPROVED_PDF_PATH: "/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf",
  CARRIER_CONTRACT_APPROVED_PDF_SHA256: "ac35ae765617010dd7551b4a22537b32715923c49601d9aac1f21bbb5e0904a8",
  CARRIER_CONTRACT_ALLOWED_PERCENTAGES: "6,8",
});

export async function onRequest(context) {
  const pathname = new URL(context.request.url).pathname;
  if (pathname === CONTRACT_ROUTE) {
    // Owner-authorized production activation. These are public integrity/config values,
    // never credentials. Existing private Service/KV/token bindings remain mandatory.
    for (const [key, value] of Object.entries(LIVE_CONTRACT)) {
      context.env[key] = value;
    }
  }
  return context.next();
}
