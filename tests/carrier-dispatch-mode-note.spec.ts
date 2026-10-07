import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const liveNote = "Review your request first. Secure delivery starts only when you choose Send to Logistics Sales.";
const previewNote = "Preview mode is active. The form prepares a review and email handoff without automatic delivery or storage.";

// Execute the actual enhancer and qualifier with synthetic DOM data. All delivery
// calls stay inside this fixture; nothing reaches a Worker or creates a lead.
function fixture(
  origin: string,
  mode = "preview",
  overrides: Record<string, string> = {},
  missingNote = false,
  deliveryResults: Array<"ok" | "error"> = ["ok"],
) {
  const compile = (source: string) => ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const qualification = { exports: {} };
  runInNewContext(compile(readFileSync(resolve("src/lib/carrier-qualification.ts"), "utf8")), {
    exports: qualification.exports, module: qualification,
  });
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const values: Record<string, string> = {
    carrier_role: "carrier", carrier_contact_name: "Synthetic Fixture",
    carrier_company_name: "Synthetic Carrier", authority_number: "MC123456",
    authority_status: "active", authority_age: "over_one_year", insurance_status: "active",
    fleet_size: "one", dispatch_status: "needs_dispatcher", carrier_email: "driver@example.invalid",
    carrier_phone: "+15555550123", equipment_class: "car_hauler", capacity_units: "3",
    available_from: future, origin_location: "Synthetic City", origin_radius: "100",
    anywhere: "on", carrier_consent: "on", ...overrides,
  };
  const element = () => ({
    dataset: {} as Record<string, string>, hidden: true, disabled: false, textContent: "", href: "",
    handlers: {} as Record<string, (event: any) => any>,
    addEventListener(type: string, handler: (event: any) => any) { this.handlers[type] = handler; },
    replaceChildren() {}, scrollIntoView() {}, checkValidity: () => true, reportValidity() {},
  });
  const selectors = ["[data-vehicle-form]", "[data-vehicle-alert]", "[data-vehicle-result]",
    "[data-vehicle-decision]", "[data-vehicle-state]", "[data-vehicle-preview]", "[data-vehicle-email]",
    "[data-send-vehicle-lead]", "[data-vehicle-delivery-status]", "[data-vehicle-boundary]", ".dispatch-mode-note"];
  const nodes = Object.fromEntries(selectors.map(selector => [selector, element()]));
  const form = nodes["[data-vehicle-form]"];
  form.dataset = { leadMode: mode, leadEndpoint: mode === "live" ? "/api/logistics-lead" : "" };
  const requests: { url: string; options: any }[] = [];
  let requestSequence = 0;
  const location = new URL("/logistics/start-car-hauling-dispatch/", origin);
  const root = { querySelector: (selector: string) => missingNote && selector === ".dispatch-mode-note" ? null : nodes[selector] || null };
  const source = readFileSync(resolve("src/components/CarrierDispatchIntakeEnhancer.astro"), "utf8");
  runInNewContext(compile(source.match(/<script>([\s\S]*?)<\/script>/)![1]), {
    exports: {}, require: () => qualification.exports, URL, AbortController,
    crypto: { randomUUID: () => `synthetic-fixture-request-${++requestSequence}` },
    window: { location, localStorage: { getItem: () => "denied" }, setTimeout, clearTimeout },
    document: { querySelector: () => root, createElement: element },
    FormData: class { get(name: string) { return values[name] ?? null; } },
    fetch: async (url: URL, options: any) => {
      requests.push({ url: url.href, options });
      if (deliveryResults.shift() === "error") throw new Error("synthetic_network_failure");
      return { ok: true };
    },
  });
  return {
    form, nodes, requests, note: nodes[".dispatch-mode-note"],
    review: () => form.handlers.submit({ preventDefault() {} }),
    send: (isTrusted = true) => nodes["[data-send-vehicle-lead]"].handlers.click({ isTrusted }),
  };
}

test("preview note matches email-only review without automatic delivery", () => {
  const view = fixture("https://preview.example.invalid");
  expect(view.note.textContent).toBe(previewNote);
  expect(view.form.dataset.leadMode).toBe("preview");
  view.review();
  expect(view.nodes["[data-vehicle-result]"].dataset.decision).not.toMatch(/needs_more_information|rejected/);
  expect(view.nodes["[data-send-vehicle-lead]"].hidden).toBe(true);
  expect(view.nodes["[data-vehicle-email]"].hidden).toBe(false);
  expect(view.requests).toHaveLength(0);
});

test("canonical host override and configured live mode show the explicit-send note", async () => {
  for (const [origin, mode] of [["https://hermeslogisticsus.com", "preview"], ["https://preview.example.invalid", "live"]]) {
    const view = fixture(origin, mode);
    expect(view.form.dataset.leadMode).toBe("live");
    expect(view.form.dataset.leadEndpoint).toBe("/api/logistics-lead");
    expect(view.note.textContent).toBe(liveNote);
    await view.send();
    expect(view.requests).toHaveLength(0);
    view.review();
    expect(view.nodes["[data-send-vehicle-lead]"].hidden).toBe(false);
    expect(view.nodes["[data-vehicle-email]"].hidden).toBe(false);
    expect(view.requests).toHaveLength(0);
    await view.send(false);
    expect(view.requests).toHaveLength(0);
    await view.send();
    expect(view.requests).toHaveLength(1);
    expect(view.requests[0].options.method).toBe("POST");
    expect(view.requests[0].url).toBe(`${origin}/api/logistics-lead`);
  }
});

test("qualification gate still blocks incomplete and rejected requests", async () => {
  for (const [fields, decision] of [[{ carrier_company_name: "" }, "needs_more_information"], [{ carrier_website: "bot" }, "rejected"]] as const) {
    const view = fixture("https://hermeslogisticsus.com", "preview", fields);
    view.review();
    expect(view.nodes["[data-vehicle-result]"].dataset.decision).toBe(decision);
    expect(view.nodes["[data-send-vehicle-lead]"].hidden).toBe(true);
    expect(view.nodes["[data-vehicle-email]"].hidden).toBe(true);
    await view.send();
    expect(view.requests).toHaveLength(0);
  }
});

test("a delivery retry reuses the same idempotency key until the form changes", async () => {
  const view = fixture("https://hermeslogisticsus.com", "live", {}, false, ["error", "ok"]);
  view.review();

  await view.send();
  expect(view.requests).toHaveLength(1);
  expect(view.nodes["[data-vehicle-delivery-status]"].textContent).toContain("Delivery was not confirmed");

  await view.send();
  expect(view.requests).toHaveLength(2);

  const requestIds = view.requests.map(({ options }) => ({
    header: options.headers["Idempotency-Key"],
    body: JSON.parse(options.body).request_id,
  }));
  expect(requestIds[0].header).toBe(requestIds[0].body);
  expect(requestIds[1].header).toBe(requestIds[1].body);
  expect(requestIds[1]).toEqual(requestIds[0]);

  view.form.handlers.input({ isTrusted: true });
  view.review();
  await view.send();
  const changedRequest = view.requests[2].options;
  expect(changedRequest.headers["Idempotency-Key"]).toBe(JSON.parse(changedRequest.body).request_id);
  expect(changedRequest.headers["Idempotency-Key"]).not.toBe(requestIds[0].header);
});

test("an absent optional mode note leaves review functional", () => {
  const view = fixture("https://hermeslogisticsus.com", "preview", {}, true);
  view.review();
  expect(view.nodes["[data-send-vehicle-lead]"].hidden).toBe(false);
  expect(view.requests).toHaveLength(0);
});
