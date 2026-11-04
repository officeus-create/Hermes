import assert from "node:assert/strict";
import fs from "node:fs";

const component = fs.readFileSync("src/components/HermesLocalAgentsLink.astro", "utf8");
const ownerWorkspace = fs.readFileSync("src/components/HermesCommandCenterOwnerWorkspace.astro", "utf8");

assert.match(ownerWorkspace, /HermesLocalAgentsLink/, "local agents entry belongs to the shared owner workspace Agents view");
assert.match(component, /http:\/\/127\.0\.0\.1:8765\/ai-agents\/\?utm_source=chatgpt\.com/);
assert.match(component, /target="_blank"/);
assert.match(component, /rel="noopener noreferrer"/);
assert.match(component, /data-local-agents-fallback/);
assert.match(component, /\/services\/hermes-connect\/internal\/ai-connect\//);
assert.match(component, /HAE processes keep running/);
assert.doesNotMatch(component, /fetch\(|XMLHttpRequest|WebSocket/);
assert.doesNotMatch(component, /0\.0\.0\.0|8766|Cf-Access|Authorization|token|secret/i);

console.log("Command Center local AI Agents link: loopback-only new tab + cloud fallback PASS");
