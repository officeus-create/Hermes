import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { onRequest as planGuard } from "../functions/api/_middleware.ts";

const callGuard = async (selectedPlan, servicePercentage) => {
  let nextCalls = 0;
  const request = new Request("https://hermeslogisticsus.com/api/carrier-contract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selected_plan: selectedPlan, service_percentage: servicePercentage }),
  });
  const response = await planGuard({
    request,
    next: async () => {
      nextCalls += 1;
      return new Response("next", { status: 204 });
    },
  });
  return { response, nextCalls };
};

for (const [plan, rate] of [["essential", "6"], ["pro", "8"], ["custom", "7.25"]]) {
  const { response, nextCalls } = await callGuard(plan, rate);
  assert.equal(response.status, 204, `${plan} ${rate}% should pass the plan guard.`);
  assert.equal(nextCalls, 1, `${plan} ${rate}% should continue to the contract handler.`);
}

for (const [plan, rate] of [["essential", "8"], ["essential", "6.25"], ["pro", "6"], ["pro", "8.25"]]) {
  const { response, nextCalls } = await callGuard(plan, rate);
  assert.equal(response.status, 400, `${plan} ${rate}% must be rejected before execution.`);
  assert.equal(nextCalls, 0, `${plan} ${rate}% must not reach the contract handler.`);
  assert.deepEqual(await response.json(), { success: false, error: "plan_percentage_mismatch" });
}

const enhancer = await readFile(new URL("../src/components/CarrierContractSafetyEnhancer.astro", import.meta.url), "utf8");
assert.match(enhancer, /essential:\s*"6"/);
assert.match(enhancer, /pro:\s*"8"/);
assert.match(enhancer, /percentage\.readOnly\s*=\s*true/);
assert.match(enhancer, /percentage\.value\s*=\s*standardRate/);
assert.match(enhancer, /scroll-margin-top:12\.25rem/);

const layout = await readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
assert.match(layout, /CarrierContractSafetyEnhancer/);

console.log("Carrier plan integrity passed: 6% and 8% standard plans stay locked to their approved rates, custom rates remain editable, and step headings clear the sticky progress card.");
