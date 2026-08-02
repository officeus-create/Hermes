import { readFile, writeFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const sourceUrl = new URL("../tests/site.spec.ts", import.meta.url);
const runtimeUrl = new URL("../tests/site.runtime.spec.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");

const future = new Date();
future.setUTCDate(future.getUTCDate() + 7);
const futureDate = future.toISOString().slice(0, 10);

const target = /await page\.locator\('input\[name="ready_date"\]'\)\.fill\("\d{4}-\d{2}-\d{2}"\);/g;
const matches = source.match(target) ?? [];
if (matches.length !== 1) {
  throw new Error(`Expected exactly one ready_date E2E fixture, found ${matches.length}`);
}

const runtimeSource = source.replace(
  target,
  `await page.locator('input[name="ready_date"]').fill("${futureDate}");`,
);

await writeFile(runtimeUrl, runtimeSource, "utf8");

try {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(command, ["playwright", "test", "tests/site.runtime.spec.ts"], {
    stdio: "inherit",
    env: process.env,
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`Playwright terminated by ${signal}`));
      else resolve(code ?? 1);
    });
  });

  if (exitCode !== 0) process.exitCode = exitCode;
} finally {
  await rm(runtimeUrl, { force: true });
}
