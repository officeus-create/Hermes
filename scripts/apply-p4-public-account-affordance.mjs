import { readFileSync, writeFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const write = (path, content) => writeFileSync(path, content);

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return source.replace(before, after);
}

function patchSwitcher() {
  const path = 'src/components/HermesConnectAccountSwitcher.astro';
  let source = read(path);

  source = replaceOnce(
    source,
    '  mode?: "panel" | "menu";\n}\n\nconst { current, mode = "panel" } = Astro.props;',
    '  mode?: "panel" | "menu";\n  publicSafe?: boolean;\n}\n\nconst { current, mode = "panel", publicSafe = false } = Astro.props;',
    'switcher publicSafe prop',
  );

  source = replaceOnce(
    source,
    '<section class="hc-account-switcher" data-hc-account-switcher data-current={switcherCurrent} data-locale="en" hidden>',
    '<section class="hc-account-switcher" data-hc-account-switcher data-current={switcherCurrent} data-public-safe={publicSafe ? "true" : undefined} data-locale="en" hidden>',
    'panel publicSafe marker',
  );

  source = replaceOnce(
    source,
    '<details class="hc-account-menu" data-hc-account-switcher data-current={switcherCurrent} data-locale="en" hidden>',
    '<details class="hc-account-menu" data-hc-account-switcher data-current={switcherCurrent} data-public-safe={publicSafe ? "true" : undefined} data-locale="en" hidden>',
    'menu publicSafe marker',
  );

  let workspaceBlocks = 0;
  source = source.replace(
    /<div class="hc-account-workspaces" aria-label=\{t\.workspaces\} data-hc-workspaces-label>([\s\S]*?)<\/div>/g,
    (_match, inner) => {
      workspaceBlocks += 1;
      return `<div class="hc-account-workspaces" aria-label={t.workspaces} data-hc-workspaces-label data-hc-dynamic-workspaces={publicSafe ? "true" : undefined}>\n        {!publicSafe && (\n          <>${inner}\n          </>\n        )}\n      </div>`;
    },
  );
  if (workspaceBlocks !== 2) throw new Error(`workspace blocks: expected 2, found ${workspaceBlocks}`);

  source = replaceOnce(
    source,
    '      const current = root.dataset.current;\n      void accountRequest.then((payload) => {',
    '      const current = root.dataset.current;\n      const publicSafe = root.dataset.publicSafe === "true";\n      void accountRequest.then((payload) => {',
    'runtime publicSafe flag',
  );

  source = replaceOnce(
    source,
    '        const aiWorkspace = workspaces.find((item) => item?.key === "internal_ai" && item?.available !== false);\n\n        const repair = root.querySelector<HTMLElement>("[data-workspace-repair]");',
    `        const aiWorkspace = workspaces.find((item) => item?.key === "internal_ai" && item?.available !== false);\n\n        if (publicSafe) {\n          const dynamicWorkspaces = root.querySelector<HTMLElement>("[data-hc-dynamic-workspaces]");\n          const entries: Array<{ key: string; label: string; kind: string }> = [];\n          if (repairBusiness) entries.push({ key: "repair", label: String(repairBusiness.name || runtimeCopy.repair), kind: runtimeCopy.owned });\n          if (academyWorkspace) entries.push({ key: "academy", label: runtimeCopy.academy, kind: runtimeCopy.shared });\n          if (hrWorkspace) entries.push({ key: "hr", label: runtimeCopy.hr, kind: runtimeCopy.internal });\n          if (aiWorkspace) entries.push({ key: "ai", label: runtimeCopy.ai, kind: runtimeCopy.internal });\n          if (beautyBusiness) entries.push({ key: "beauty", label: String(beautyBusiness.name || runtimeCopy.beauty), kind: runtimeCopy.owned });\n\n          if (!dynamicWorkspaces || entries.length === 0) {\n            root.hidden = true;\n            return;\n          }\n\n          dynamicWorkspaces.replaceChildren();\n          entries.forEach((entry) => {\n            const href = workspacePaths[entry.key];\n            if (!href) return;\n            const link = document.createElement("a");\n            link.className = \`hc-account-workspace \${entry.key}\`;\n            link.dataset.hcWorkspaceLink = entry.key;\n            link.href = withLocale(href);\n\n            const dot = document.createElement("span");\n            dot.className = "hc-workspace-dot";\n            dot.setAttribute("aria-hidden", "true");\n\n            const text = document.createElement("span");\n            const strong = document.createElement("strong");\n            strong.textContent = entry.label;\n            const small = document.createElement("small");\n            small.textContent = entry.kind;\n            text.append(strong, small);\n\n            const action = document.createElement("em");\n            action.textContent = runtimeCopy.open;\n            link.append(dot, text, action);\n            link.addEventListener("click", () => {\n              if (root instanceof HTMLDetailsElement) root.open = false;\n            });\n            dynamicWorkspaces.append(link);\n          });\n\n          if (!dynamicWorkspaces.querySelector("a")) {\n            root.hidden = true;\n            return;\n          }\n          root.hidden = false;\n          return;\n        }\n\n        const repair = root.querySelector<HTMLElement>("[data-workspace-repair]");`,
    'publicSafe dynamic workspace hydration',
  );

  write(path, source);
}

function patchHeader() {
  const path = 'src/components/SiteHeader.astro';
  let source = read(path);

  source = replaceOnce(
    source,
    'const isHermesConnectRoute = currentPath.startsWith("/services/hermes-connect");',
    'const isHermesConnectRoute = currentPath.startsWith("/services/hermes-connect");\nconst isHermesConnectLanding = currentPath === "/services/hermes-connect" || currentPath === "/services/hermes-connect/";',
    'Hermes Connect landing predicate',
  );

  source = replaceOnce(
    source,
    '    {privateWorkspace && <HermesConnectAccountSwitcher current={privateWorkspace} mode="menu" />}\n    <details class="language-menu"',
    '    {privateWorkspace && <HermesConnectAccountSwitcher current={privateWorkspace} mode="menu" />}\n    {!privateWorkspace && isHermesConnectLanding && <HermesConnectAccountSwitcher current="neutral" mode="menu" publicSafe />}\n    <details class="language-menu"',
    'desktop public account affordance',
  );

  source = replaceOnce(
    source,
    '    {privateWorkspace && <div class="hc-mobile-account-panel"><HermesConnectAccountSwitcher current={privateWorkspace} /></div>}\n    <HermesConnectLauncher',
    '    {privateWorkspace && <div class="hc-mobile-account-panel"><HermesConnectAccountSwitcher current={privateWorkspace} /></div>}\n    {!privateWorkspace && isHermesConnectLanding && <div class="hc-mobile-account-panel"><HermesConnectAccountSwitcher current="neutral" publicSafe /></div>}\n    <HermesConnectLauncher',
    'mobile public account affordance',
  );

  write(path, source);
}

function patchContract() {
  const path = 'scripts/hermes-connect-account-switcher-contract.test.mjs';
  let source = read(path);

  source = replaceOnce(
    source,
    "const switcherUrl = new URL('../src/components/HermesConnectAccountSwitcher.astro', import.meta.url);\n\nasync function loadSwitcher() {\n  return readFile(switcherUrl, 'utf8');\n}",
    "const switcherUrl = new URL('../src/components/HermesConnectAccountSwitcher.astro', import.meta.url);\nconst headerUrl = new URL('../src/components/SiteHeader.astro', import.meta.url);\n\nasync function loadSwitcher() {\n  return readFile(switcherUrl, 'utf8');\n}\n\nasync function loadHeader() {\n  return readFile(headerUrl, 'utf8');\n}",
    'contract header loader',
  );

  source += `\n\ntest('public Hermes Connect account affordance is auth-hydrated without SSR private workspace anchors', async () => {\n  const source = await loadSwitcher();\n  const header = await loadHeader();\n\n  assert.match(source, /publicSafe\\?: boolean/);\n  assert.match(source, /data-public-safe=\\{publicSafe \\? "true" : undefined\\}/);\n  assert.match(source, /data-hc-dynamic-workspaces=\\{publicSafe \\? "true" : undefined\\}/);\n  assert.match(source, /\\{!publicSafe && \\(/);\n  assert.match(source, /const publicSafe = root\\.dataset\\.publicSafe === "true"/);\n  assert.match(source, /if \\(publicSafe\\) \\{/);\n  assert.match(source, /document\\.createElement\\("a"\\)/);\n  assert.match(source, /if \\(!dynamicWorkspaces \\|\\| entries\\.length === 0\\)/);\n\n  assert.match(header, /const isHermesConnectLanding = currentPath === "\\/services\\/hermes-connect" \\|\\| currentPath === "\\/services\\/hermes-connect\\/"/);\n  assert.match(header, /HermesConnectAccountSwitcher current="neutral" mode="menu" publicSafe/);\n  assert.match(header, /HermesConnectAccountSwitcher current="neutral" publicSafe/);\n});\n`;

  write(path, source);
}

function patchBrowserProof() {
  const path = 'tests/hermes-connect-account-portfolio.spec.ts';
  let source = read(path);

  source += `\n\ntest("public Hermes Connect landing reveals only the backend-authorized portfolio", async ({ page }) => {\n  await page.setViewportSize({ width: 1280, height: 900 });\n  await page.route("**/api/hermes-connect/account", (route: any) => route.fulfill(json(accountPortfolio)));\n\n  const raw = await page.request.get("/services/hermes-connect/?lang=ru");\n  const rawHtml = await raw.text();\n  expect(rawHtml).not.toContain("/demos/hermes-connect/hr-admin.html");\n  expect(rawHtml).not.toContain("/services/hermes-connect/internal/ai-connect/");\n\n  await page.goto("/services/hermes-connect/?lang=ru", { waitUntil: "domcontentloaded" });\n  const menu = page.locator('header details[data-hc-account-switcher][data-public-safe="true"]');\n  await expect(menu).toBeVisible();\n  await expect(menu.locator("[data-account-name]")).toHaveText(identity.specialist.name);\n  await menu.locator("summary").click();\n\n  const repair = menu.locator('[data-hc-workspace-link="repair"]');\n  const academy = menu.locator('[data-hc-workspace-link="academy"]');\n  const beauty = menu.locator('[data-hc-workspace-link="beauty"]');\n  await expect(repair).toHaveCount(1);\n  await expect(academy).toHaveCount(1);\n  await expect(beauty).toHaveCount(1);\n  await expect(menu.locator('[data-hc-workspace-link="ai"]')).toHaveCount(0);\n  await expect(menu.locator('[data-hc-workspace-link="hr"]')).toHaveCount(0);\n  await expect(repair).toHaveAttribute("href", /\\/repair-shops\\/dashboard\\/\\?lang=ru$/);\n  await expect(academy).toHaveAttribute("href", /\\/academy\\/dashboard\\/\\?lang=ru$/);\n  await expect(beauty).toHaveAttribute("href", /\\/beauty\\/workspace\\/\\?lang=ru$/);\n});\n\ntest("public Hermes Connect account affordance stays hidden when account auth fails", async ({ page }) => {\n  await page.setViewportSize({ width: 1280, height: 900 });\n  await page.route("**/api/hermes-connect/account", (route: any) => route.fulfill(json({ success: false, error: "unauthorized" }, 401)));\n  await page.goto("/services/hermes-connect/", { waitUntil: "domcontentloaded" });\n  await expect(page.locator('header details[data-hc-account-switcher][data-public-safe="true"]')).toBeHidden();\n});\n`;

  write(path, source);
}

patchSwitcher();
patchHeader();
patchContract();
patchBrowserProof();

const switcher = read('src/components/HermesConnectAccountSwitcher.astro');
const header = read('src/components/SiteHeader.astro');
if (!switcher.includes('publicSafe')) throw new Error('publicSafe patch missing');
if (!header.includes('current="neutral" mode="menu" publicSafe')) throw new Error('public header affordance missing');
if (header.includes('/demos/hermes-connect/hr-admin.html')) throw new Error('public header must not hardcode HR route');
console.log('P4 public authenticated-account affordance patch applied safely.');
