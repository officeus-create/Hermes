import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/api/carrier-contract.ts", "utf8");

for (const field of [
  "trial_selected",
  "trial_start_date",
  "trial_end_date",
  "trial_service_percentage",
  "consent_no_auto_continuation",
]) assert.match(source, new RegExp(field), `missing ${field}`);

assert.match(source, /const LEGAL_EXECUTION_APPROVED = false;/, "source-only staging must not activate legal execution");
assert.match(source, /trialEnd\.raw !== addUtcDays\(trialStart\.date, 13\)/, "trial must be exactly 14 consecutive calendar days inclusive");
assert.match(source, /input\.consent_no_auto_continuation !== true/, "selected trial must require explicit no-auto-continuation consent");
assert.match(source, /trialSelected\?\`Selected \| \$\{contract\.trialStartDate\} through \$\{contract\.trialEndDate\}/, "signed Appendix A must record trial window");
assert.match(source, /Trial \$\{contract\.trialPercentage\} \| Standard after trial \$\{contract\.percentage\}/, "signed Appendix A must record separate trial and standard rates");
assert.match(source, /No automatic continuation/, "signed evidence must preserve the no-auto-conversion rule");
assert.match(source, /trialSelected\?"yes":"no"/, "delivery evidence must state whether a trial was selected");
assert.match(source, /liveApproved=LEGAL_EXECUTION_APPROVED&&requestedMode==="live"/, "runtime live mode must remain behind the legal source gate");

const candidate = fs.readFileSync("docs/CARRIER_AGREEMENT_14DAY_CANDIDATE_2026-11-02.md", "utf8");
assert.match(candidate, /e91c5b25f98c46d85cb21fc474e360360daaa71eb527e33027811c37ac474424/);
assert.match(candidate, /171945 bytes/);
assert.match(candidate, /7 US Letter pages/);
assert.match(candidate, /NOT a production activation/);
assert.match(candidate, /material-term reconciliation/i);

console.log("carrier 14-day execution schema: PASS");
