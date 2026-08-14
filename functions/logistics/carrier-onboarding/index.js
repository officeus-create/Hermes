const replacements = [
  ["Hermes Logistics · Private agreement packet", "Hermes Logistics · Private carrier agreement"],
  ["create the signed PDF review packet", "create the signed PDF agreement packet"],
  ["v3 attorney-review packet", "Execution agreement · standard 6% / 8% plans"],
  ["The page can create a signed review record. Final execution activates only when Hermes publishes a counsel-approved master PDF and production verifies its version, SHA-256, allowed percentage, and execution controls.", "For the standard 6% and 8% plans, the server creates an execution package only after verifying the approved master version, SHA-256 fingerprint, allowed percentage, and delivery controls. Custom proposals remain pending Hermes approval."],
  ["Read the full v3 draft", "Read the full agreement"],
  ["Open the full v3 attorney-review draft in a new tab", "Open the full execution agreement in a new tab"],
  ["Review mode is not final legal activation.", "Execution integrity check."],
  ["Until Hermes activates a counsel-approved master version and allowed percentage, this workflow creates a signed review packet rather than a final executed agreement.", "Standard 6% and 8% plans are accepted in execution mode only when the approved master version, file fingerprint, and percentage match. A custom proposal stays non-final until Hermes accepts matching written terms."],
  ["create a signed review packet", "create a signed agreement packet"],
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
