import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  internalLoadBoardCapability,
  specialistHasInternalLoadBoardAccess,
} from "../functions/api/_lib/load-board-internal-access.mjs";

function dbFor({owner=false,dispatcher=false}={}) {
  return {
    prepare(sql) {
      return {
        bind() { return this; },
        async run() { return {success:true,meta:{changes:1}}; },
        async all() { return {results:[]}; },
        async first() {
          if (sql.includes("FROM hermes_internal_owner_access")) return owner ? {specialist_id:"sp_1"} : null;
          if (sql.includes("FROM hermes_load_board_internal_dispatchers")) return dispatcher ? {specialist_id:"sp_1"} : null;
          return null;
        },
      };
    },
  };
}

const owner = await internalLoadBoardCapability(dbFor({owner:true}), "sp_1");
assert.deepEqual(owner,{allowed:true,owner:true,dispatcher:true});
assert.equal(await specialistHasInternalLoadBoardAccess(dbFor({dispatcher:true}),"sp_1"),true);
assert.equal(await specialistHasInternalLoadBoardAccess(dbFor(),"sp_1"),false);
assert.equal(await specialistHasInternalLoadBoardAccess(dbFor(),""),false);

const endpoint=readFileSync(new URL("../functions/api/load-board/dispatcher-access.ts",import.meta.url),"utf8");
assert.match(endpoint,/workspaceSameOrigin/);
assert.match(endpoint,/specialistHasInternalOwnerCapability/);
assert.match(endpoint,/identityVerified!==true/);
assert.match(endpoint,/account_not_registered/);
assert.match(endpoint,/HERMES_INTERNAL_DISPATCHER/);
assert.match(endpoint,/emailsSent:false/);
assert.match(endpoint,/dispatcherNotificationsSent:false/);
assert.match(endpoint,/externalContactsPerformed:false/);
assert.doesNotMatch(endpoint,/fetch\s*\(/);

const company=readFileSync(new URL("../functions/api/_lib/hermes-company-profiles.mjs",import.meta.url),"utf8");
const workspace=readFileSync(new URL("../functions/api/_lib/carrier-dispatch-workspace.mjs",import.meta.url),"utf8");
assert.match(company,/specialistHasInternalLoadBoardAccess\(db, specialist\.id\)/);
assert.match(workspace,/specialistHasInternalLoadBoardAccess\(db, specialist\.id\)/);

console.log("load_board_internal_dispatcher_access PASS");
