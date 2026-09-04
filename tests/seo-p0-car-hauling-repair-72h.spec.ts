import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

test("car hauling owner targets proven load-search demand without multiplying owners", () => {
  const source = read("src/pages/logistics/car-hauling-dispatch/index.astro");

  expect(source).toContain("find car hauling loads");
  expect(source).toContain("car hauler load board");
  expect(source).toContain("Where can I find car hauling loads?");
  expect(source).toContain('/load-board/?role=carrier&equipment=car_hauler#available-loads');
  expect(source).toContain('/logistics/start-car-hauling-dispatch/');
});

test("repair shop owner targets verified US software demand on one canonical page", () => {
  const source = read("src/pages/services/hermes-connect/repair-shops.astro");

  expect(source).toContain("Auto Repair Shop Management Software & Online Booking");
  expect(source).toContain("repair shop management software");
  expect(source).toContain("auto repair shop management software");
  expect(source).toContain("truck and diesel");
  expect(source).toContain("mobile mechanic");
  expect(source).toContain("tire service");
  expect(source).toContain("body or collision shops");
  expect(source).toContain('/services/hermes-connect/repair-shops/auth/?mode=register');
});

test("repair shop commercial funnel is attributable to the existing canonical owner", () => {
  const enhancer = read("src/components/Seo4ConversionEnhancer.astro");

  expect(enhancer).toContain('cta_type: "repair_shop_registration"');
  expect(enhancer).toContain('cta_type: "repair_shop_plan"');
  expect(enhancer).toContain('service_group: "repair_shop_software"');
  expect(enhancer).toContain('event: "repair_shop_registration_start"');
  expect(enhancer).toContain('form.id !== "register-form"');
});
