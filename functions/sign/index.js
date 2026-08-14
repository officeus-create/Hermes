const replacements = [
  ["completing a carrier agreement review packet", "completing the carrier agreement"],
  ["complete the review packet from your phone", "complete the carrier agreement from your phone"],
  ["create the signed review packet", "create the signed agreement packet"],
  ["keep the PDF review packet", "keep the signed PDF packet"],
  ["Final legal execution remains disabled until Hermes activates an approved master agreement whose scope, percentage, version, and file fingerprint match the carrier packet.", "Standard 6% and 8% agreements use the approved execution master only after the server verifies its version, SHA-256 fingerprint, and allowed percentage. Custom proposals remain pending Hermes approval."],
  ["The percentage and selected scope must appear in Appendix A and match the approved execution version before final activation.", "The percentage and selected scope appear in Appendix A and must match the approved execution version before the server accepts the signature."],
];

export async function onRequest(context) {
  const response = await context.env.ASSETS.fetch(context.request);
  const type = response.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("text/html")) return response;
  let html = await response.text();
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-store");
  return new Response(html, { status: response.status, headers });
}
