import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [launcher, account] = await Promise.all([
  readFile(new URL("src/components/HermesConnectLauncher.astro", root), "utf8"),
  readFile(new URL("src/components/HermesConnectGlobalAccount.astro", root), "utf8"),
]);

test("global Hermes account presence is mounted through the canonical site launcher", () => {
  assert.match(launcher, /HermesConnectGlobalAccount/);
  assert.match(launcher, /variant === "header" && <HermesConnectGlobalAccount variant="header"/);
  assert.match(launcher, /variant === "mobile" && <HermesConnectGlobalAccount variant="mobile"/);
});

test("global account presence reuses the unified portfolio and fails closed when signed out", () => {
  assert.match(account, /\/api\/hermes-connect\/account/);
  assert.doesNotMatch(account, /\/api\/auth\/me/);
  assert.doesNotMatch(account, /\/api\/repair-shop\/profile/);
  assert.doesNotMatch(account, /\/api\/internal-ai\/status/);
  assert.match(account, /root\.hidden = false/);
  assert.match(account, /root\.hidden = true/);
});

test("global account presence does not duplicate the existing private workspace switcher", () => {
  assert.match(account, /isPrivateWorkspace/);
  assert.match(account, /!isPrivateWorkspace && variant === "header"/);
  assert.match(account, /!isPrivateWorkspace && variant === "mobile"/);
});
