import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [enhancer, customerActions, layout, repairLanding, paidPlan, activationEnhancer, activationStyles, activationRuntime, offerContract] = await Promise.all([
  readFile(new URL("../src/components/RepairBookingGrowthEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairBookingCustomerActionsEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/pages/services/hermes-connect/repair-shops/plan.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/components/RepairShopActivationEnhancer.astro", import.meta.url), "utf8"),
  readFile(new URL("../src/styles/repair-shop-activation.css", import.meta.url), "utf8"),
  readFile(new URL("../public/repair-shop-activation.js", import.meta.url), "utf8"),
  readFile(new URL("../src/data/hermes-connect-repair-shop-offer.ts", import.meta.url), "utf8"),
]);

assert.match(layout, /RepairBookingGrowthEnhancer/);
assert.match(enhancer, /RepairBookingCustomerActionsEnhancer/);
assert.match(enhancer, /no Hermes\/ProgressoPro B2B cross-sell/i);
assert.doesNotMatch(enhancer, /Grow My Business \/ Talk to Hermes/);
assert.doesNotMatch(enhancer, /data-growth-consent/);
assert.doesNotMatch(enhancer, /repair-booking-growth\.js/);
assert.doesNotMatch(enhancer, /\/api\/logistics-lead/);
assert.match(customerActions, /\/api\/public\/repair-shop\?slug=/);
assert.match(customerActions, /data-call-shop/);
assert.match(customerActions, /data-shop-directions/);
assert.match(customerActions, /tel:/);
assert.match(customerActions, /google\.com\/maps\/search/);
assert.doesNotMatch(customerActions, /client-name|client-email|client-phone|\/api\/logistics-lead|ProgressoPro/i);

assert.match(repairLanding, /Give customers one link to book your repair shop\./);
assert.match(repairLanding, /\/services\/hermes-connect\/repair-shops\/plan\//);
assert.match(repairLanding, /Founding Shop Plan: \$99\/month per location/);
assert.doesNotMatch(repairLanding, /Current live pilot/);

assert.match(offerContract, /REPAIR_SHOP_OFFER_STATUS\s*=\s*"current-public-offer"/);
assert.match(offerContract, /id:\s*"repair_shop_founding"/);
assert.match(offerContract, /priceMonthlyUsd:\s*99/);
assert.match(offerContract, /purchaseFlow:\s*"human-confirmation-and-invoice"/);
for (const state of ["trialing", "founding", "active", "past_due", "cancelled", "comped"]) assert.match(offerContract, new RegExp(`"${state}"`));
const publicPrice = offerContract.match(/priceMonthlyUsd:\s*(\d+)/)?.[1];
assert.equal(publicPrice, "99");
assert.match(paidPlan, new RegExp(`\\$${publicPrice}\\/month`));
assert.match(paidPlan, /Founding Shop Plan/);
assert.match(paidPlan, /per repair shop location/);
assert.match(paidPlan, /Try the workspace first/);
assert.match(paidPlan, /id="plan-consent" type="checkbox" required/);
assert.match(paidPlan, /fetch\("\/api\/logistics-lead"/);
assert.match(paidPlan, /"Idempotency-Key": requestId/);
assert.match(paidPlan, /connect_paid_plan_requested/);
assert.match(paidPlan, /No payment is taken here/);
assert.match(paidPlan, /"@type": "Service"/);
assert.match(paidPlan, /"@type": "BreadcrumbList"/);
assert.match(paidPlan, /"@type": "FAQPage"/);
assert.doesNotMatch(paidPlan, /js\.stripe\.com|from\s+["']stripe["']|payment_intents|checkout\.sessions\.create|paypal\.com\/sdk/i);
assert.doesNotMatch(paidPlan, /window\.dataLayer(?:\.|\?\.)push\(\{[^}]*\b(?:email|phone|contactName|shopName|cityState|goal)\b[^}]*\}\)/s);

assert.match(layout, /RepairShopActivationEnhancer/);
assert.match(layout, /RepairShopFreeLaunchOffer/);
assert.match(activationEnhancer, /\/repair-shop-activation\.js/);
assert.match(activationEnhancer, /repair-shop-activation\.css/);
assert.match(activationStyles, /\.repair-activation-panel/);
assert.match(activationRuntime, /Get your shop ready for customers/);
assert.match(activationRuntime, /Подготовьте СТО к приёму клиентов/);
assert.match(activationRuntime, /Prepara tu taller para recibir clientes/);
assert.match(activationRuntime, /Prepara l’officina per i clienti/);
assert.match(activationRuntime, /Préparez votre atelier à recevoir des clients/);
assert.match(activationRuntime, /Підготуйте СТО до прийому клієнтів/);
assert.match(activationRuntime, /\/api\/repair-shop\/profile/);
assert.match(activationRuntime, /\/api\/services/);
assert.match(activationRuntime, /\/api\/repair-shop\/availability/);
assert.match(activationRuntime, /\/api\/repair-shop\/bookings/);
assert.match(activationRuntime, /serviceCount >= 3/);
assert.match(activationRuntime, /first_completed_booking/);
assert.match(activationRuntime, /completedCount\/6|completedCount}\s*\/\s*6|completedCount}\/6/);
assert.match(activationRuntime, /connect_shop_activation_view/);
assert.match(activationRuntime, /connect_shop_share_link/);
assert.match(activationRuntime, /connect_shop_plan_view/);
assert.match(activationRuntime, /connect_shop_paid_cta/);
assert.match(activationRuntime, /(?:\/repair-shops\/plan\/|\$\{ROOT\}\/plan\/)/);
assert.match(activationRuntime, /CURRENT PRODUCT/);
assert.match(activationRuntime, /Customer booking times are generated from these hours/);
assert.match(activationRuntime, /Repair pricing is set by the shop/);
assert.doesNotMatch(activationRuntime, /window\.dataLayer(?:\.|\?\.)push\(\{[^}]*\b(?:email|phone|name|shopName|slug|client)\b[^}]*\}\)/s);

console.log("Repair Shop customer-focused booking actions, extracted activation styling, free launch entry, revenue, offer state, six-step activation, multilingual UX, and zero-PII telemetry contracts passed.");