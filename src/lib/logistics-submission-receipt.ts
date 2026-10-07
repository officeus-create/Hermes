/** The current receiver confirms Worker handoff only, not mailbox or human receipt. */
export async function requireSubmittedReceipt(response: Response, requestId: string) {
  if (!response.ok) throw new Error("submission_unconfirmed");
  const receipt: unknown = await response.json();
  if (!receipt || typeof receipt !== "object"
    || !("success" in receipt) || receipt.success !== true
    || !("request_id" in receipt) || receipt.request_id !== requestId) {
    throw new Error("submission_unconfirmed");
  }
  return { submission: "submitted", delivery: "unconfirmed", humanReceipt: "unconfirmed" } as const;
}

export const submittedReceiptCopy = "Submitted: the request service accepted this request. Delivery confirmation and human receipt are not yet available. Submission is not a booking.";

// Keep an ambiguous network retry attached to the same reviewed lead.
const requestIds = new WeakMap<object, string>();
function secureRequestId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Older browsers may provide secure randomness without the UUID convenience API.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export function submissionRequestId(lead: object): string {
  let requestId = requestIds.get(lead);
  if (!requestId) {
    requestId = secureRequestId();
    requestIds.set(lead, requestId);
  }
  return requestId;
}
