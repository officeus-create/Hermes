const executionPdf = "/contracts/Hermes_Carrier_Agreement_EXECUTION_v2026-08-06.pdf";
const replacements = [
  ["Hermes Logistics · v3 attorney-review draft", "Hermes Logistics · execution agreement"],
  ["Carrier Agreement v3 Review", "Carrier Agreement"],
  ["Review the 60-second business summary and full v3 carrier administrative and dispatch support agreement draft, then continue to the carrier-specific Appendix A packet.", "Review the business terms and continue to the carrier-specific Appendix A signing packet."],
  ["Business draft for Wisconsin transportation counsel", "Owner-authorized execution master · standard 6% / 8% plans"],
  ["This v3 file is not represented as attorney-approved or ready for final execution. Production signing remains blocked until Hermes activates an approved master version, immutable PDF hash, and allowed percentage.", "Hermes has authorized the execution master for the standard 6% and 8% plans. The server accepts a signature only when the master version, immutable SHA-256 fingerprint, and allowed percentage match. This is not represented as outside-counsel approval. Custom proposals remain pending Hermes approval."],
  ["The proposed v3 structure allows termination", "The agreement allows termination"],
  ["The v3 draft uses documented costs", "The agreement uses documented costs"],
  ["The v3 draft does not include", "The agreement does not include"],
  ["Full v3 draft", "Execution master"],
  ["Seven pages, repeated branded header, Appendix A, and no fixed percentage.", "The execution master plus the carrier-specific Appendix A form the signing package."],
  ["The files are identical in business substance and remain marked <strong>ATTORNEY REVIEW DRAFT - NOT FOR EXECUTION</strong>. Use HTML for comfortable phone review and PDF for stable sharing or counsel review.", "Use the execution PDF for the controlling master terms. The carrier-specific service model, percentage, signer record, electronic consent, and signature are captured in Appendix A."],
  ["Read HTML version", "Open execution PDF"],
  ["Open PDF viewer", "Open execution PDF"],
  ["In review mode, the resulting PDF is clearly labeled as a signed review packet rather than a final activated agreement.", "For standard 6% and 8% plans, the resulting Appendix A is generated in execution mode only after the server verifies the approved master. Custom proposals remain pending Hermes approval."],
];

export async function onRequest(context) {
  const response = await context.env.ASSETS.fetch(context.request);
  const type = response.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("text/html")) return response;
  let html = await response.text();
  for (const [from, to] of replacements) html = html.replaceAll(from, to);
  html = html
    .replaceAll("/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.pdf", executionPdf)
    .replaceAll("/contracts/carrier-agreement-v3/", executionPdf)
    .replaceAll("/contracts/Hermes_Carrier_Administrative_and_Dispatch_Support_Agreement_v3_ATTORNEY_REVIEW.html", executionPdf);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-store");
  return new Response(html, { status: response.status, headers });
}
