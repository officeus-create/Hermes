import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { classifyBusinessSocialDriveGovernance } from "../functions/api/_lib/business-social-drive.mjs";

const observedAt="2026-11-03T20:00:00.000Z";
const exposed=classifyBusinessSocialDriveGovernance({
  observedAt,
  files:[
    {id:"raw-file-id-must-not-escape",mimeType:"application/pdf",permissions:[
      {type:"anyone",role:"writer",allowFileDiscovery:true},
      {type:"domain",role:"reader"},
    ]},
  ],
});
assert.equal(exposed.source_authenticated,true);
assert.equal(exposed.source_trusted,true);
assert.equal(exposed.coverage_complete,true);
assert.equal(exposed.findings.some((item)=>item.category==="PUBLIC_WRITE_EXPOSURE"&&item.severity==="P0"),true);
assert.equal(exposed.findings.some((item)=>item.category==="PUBLIC_DISCOVERY_ENABLED"),true);
assert.equal(exposed.findings.some((item)=>item.category==="DOMAIN_READ_EXPOSURE"),true);
assert.equal(JSON.stringify(exposed).includes("raw-file-id-must-not-escape"),false);

const partial=classifyBusinessSocialDriveGovernance({
  observedAt,
  files:[],
  truncated:true,
  nestedFolder:true,
});
assert.equal(partial.coverage_complete,false);
assert.equal(partial.findings.some((item)=>item.status==="UNKNOWN"),true);

const clean=classifyBusinessSocialDriveGovernance({observedAt,files:[{permissions:[]}]});
assert.equal(clean.coverage_complete,true);
assert.deepEqual(clean.findings,[]);

const endpoint=await readFile(new URL("../functions/api/internal/audit/drive.ts",import.meta.url),"utf8");
const driveLib=await readFile(new URL("../functions/api/_lib/business-social-drive.mjs",import.meta.url),"utf8");

assert.match(endpoint,/requireInternalOwner/);
assert.match(endpoint,/sameOriginMutation/);
assert.match(endpoint,/job_type:"audit\.drive\.truth"/);
assert.match(endpoint,/policy_version:"hae-drive-auditor-source-v1"/);
assert.match(endpoint,/provider_write_performed:false/);
assert.match(endpoint,/google_provider_write_performed:false/);
assert.match(endpoint,/source_authenticated:true/);
assert.match(endpoint,/source_trusted:true/);
assert.match(endpoint,/WHERE owner_specialist_id=\? AND source_kind='google_drive'/);
assert.doesNotMatch(endpoint,/readBusinessSocialDriveSource/);
assert.doesNotMatch(endpoint,/token_ciphertext/);
assert.doesNotMatch(endpoint,/access_token/);
assert.match(driveLib,/readonlyBusinessSocialDriveAccessToken/);
assert.match(driveLib,/drive_authorization_refresh_required/);
assert.match(driveLib,/permissions\(type,role,allowFileDiscovery,deleted\)/);

console.log("HAE Drive auditor source adapter PASS");
