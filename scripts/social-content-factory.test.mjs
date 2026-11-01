import assert from "node:assert/strict";
import {
  SOCIAL_LANES,
  SOCIAL_PLATFORMS,
  accountKeyForLane,
  buildHourlySocialPackage,
  buildSocialTrackedUrl,
  laneForAccountKey,
  HERMES_SOCIAL_THEMES,
  PROGRESSOPRO_SOCIAL_THEMES,
} from "../workers/automation-engine/src/social-content-factory.mjs";

assert.deepEqual(SOCIAL_LANES, ["HERMES_LOGISTICS","PROGRESSOPRO"]);
assert.deepEqual(SOCIAL_PLATFORMS, ["threads","instagram","facebook","x"]);
assert.equal(accountKeyForLane("HERMES_LOGISTICS"), "hermes_logistics");
assert.equal(accountKeyForLane("PROGRESSOPRO"), "progressopro");
assert.equal(laneForAccountKey("hermes_logistics"), "HERMES_LOGISTICS");
assert.equal(laneForAccountKey("progressopro"), "PROGRESSOPRO");

const hermesThemeIds=new Set(HERMES_SOCIAL_THEMES.map(theme=>theme.id));
for(const required of ["deadhead","rpm","load-fit","broker-setup","paperwork","route-sequence","equipment-fit","dealer-inventory","auction-readiness","delivery-to-invoice"]){
  assert.equal(hermesThemeIds.has(required),true,"missing Hermes social theme "+required);
}
const progressoThemeIds=new Set(PROGRESSOPRO_SOCIAL_THEMES.map(theme=>theme.id));
for(const required of ["website-conversion","seo-geo","social-demand","crm-followup","offer-positioning","automation","website-system","local-seo","technology-systems","hermes-connect","academy-training"]){
  assert.equal(progressoThemeIds.has(required),true,"missing ProgressoPro social theme "+required);
}
assert.equal(HERMES_SOCIAL_THEMES.some(theme=>String(theme.path).includes("carrier-offer")),false,"public social factory must not route to private/noindex carrier offer");

for (const [lane,themes] of [["HERMES_LOGISTICS",HERMES_SOCIAL_THEMES],["PROGRESSOPRO",PROGRESSOPRO_SOCIAL_THEMES]]) {
  for (let variantIndex=0; variantIndex<themes.length; variantIndex+=1) {
    const pack=buildHourlySocialPackage(lane,"2026-11-01T10",variantIndex);
    assert.ok([...pack.variants.x.body].length<=280,`X variant overflow for ${lane}/${pack.canonical.topic}`);
    assert.ok(new TextEncoder().encode(pack.variants.threads.body).byteLength<=500,`Threads overflow for ${lane}/${pack.canonical.topic}`);
  }
}

for (const lane of SOCIAL_LANES) {
  const seen = new Set();
  for (const hour of ["06","07","08","09","10","11","12","13","14","15","16","17","18","19"]) {
    const slot = "2026-11-01T" + hour;
    const pack = buildHourlySocialPackage(lane, slot);
    assert.equal(pack.canonical.lane, lane);
    assert.equal(pack.canonical.market, "US");
    assert.ok(pack.canonical.source_url.startsWith("https://hermeslogisticsus.com/"));
    assert.equal(Object.keys(pack.variants).length, 4);
    assert.ok(new TextEncoder().encode(pack.variants.threads.body).byteLength <= 500);
    assert.ok([...pack.variants.x.body].length <= 280);
    assert.ok(pack.variants.facebook.body.includes("utm_source=facebook"));
    assert.ok(pack.variants.threads.body.includes("utm_source=threads"));
    assert.ok(pack.variants.x.body.includes("utm_source=x"));
    assert.equal(pack.variants.instagram.state, "DRAFT_REQUIRES_MEDIA");
    assert.equal(pack.variants.x.state, "HOLD_PAID_PROVIDER");
    assert.equal(pack.variants.threads.state, "READY_FOR_PROVIDER_GATE");
    assert.equal(pack.variants.facebook.state, "READY_FOR_PROVIDER_GATE");
    if (lane === "HERMES_LOGISTICS") {
      assert.doesNotMatch(JSON.stringify(pack), /ProgressoPro|Academy|website package|marketing agency/i);
      assert.match(pack.canonical.campaign, /car_hauler/);
    } else {
      assert.doesNotMatch(JSON.stringify(pack), /guaranteed loads|car hauler loads|owner-operator pay/i);
      assert.equal(pack.canonical.campaign, "progressopro_growth");
    }
    seen.add(pack.canonical.topic);
  }
  assert.ok(seen.size >= 4, "hourly rotation should cover multiple themes for " + lane);
}

const url = new URL(buildSocialTrackedUrl("/paths/marketing/","threads","PROGRESSOPRO","seo-geo","2026-11-01T10"));
assert.equal(url.searchParams.get("utm_source"), "threads");
assert.equal(url.searchParams.get("utm_medium"), "organic_social");
assert.equal(url.searchParams.get("utm_campaign"), "progressopro_growth");
assert.match(url.searchParams.get("utm_content"), /^seo-geo-/);

assert.throws(() => buildHourlySocialPackage("UNKNOWN","2026-11-01T10"), /social_lane_invalid/);
assert.throws(() => buildHourlySocialPackage("HERMES_LOGISTICS","bad-slot"), /social_slot_invalid/);

console.log("social hourly content factory PASS — two brands, four platform-native variants, bounded claims and UTMs");
