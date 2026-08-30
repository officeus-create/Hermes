import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(join(root, path), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const bootstrap = await read("scripts/ai/bootstrap-hermes-openssl.sh");
const setup = await read("scripts/ai/setup-codex-hermes.sh");
const docs = await read("docs/CODEX_HERMES_RUNTIME.md");
const workflow = await read(".github/workflows/codex-hermes-router.yml");

assert(bootstrap.includes('OPENSSL_VERSION="3.5.4"'), "OpenSSL bootstrap must pin version 3.5.4.");
assert(bootstrap.includes('OPENSSL_SHA256="967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99"'), "OpenSSL bootstrap must pin the reviewed SHA-256.");
assert(bootstrap.includes('https://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz'), "OpenSSL bootstrap must use the official OpenSSL source URL.");
assert(bootstrap.includes("--proto '=https'") && bootstrap.includes("--tlsv1.2"), "OpenSSL download must be HTTPS-only with an explicit TLS floor.");
assert(bootstrap.includes("shasum -a 256 -c -"), "OpenSSL archive must be verified before extraction/build.");
assert(bootstrap.includes("darwin64-x86_64-cc") && bootstrap.includes("no-shared"), "OpenSSL build must target Intel macOS and static libraries.");
assert(bootstrap.includes('"--verify"'), "Bootstrap must expose a fail-closed verification mode for explicit isolated OpenSSL paths.");
assert(bootstrap.includes("/usr/*") && bootstrap.includes("/System/*") && bootstrap.includes("/opt/homebrew/*") && bootstrap.includes("/opt/local/*"), "Bootstrap must reject system, Homebrew, and MacPorts targets.");
assert(bootstrap.includes("lib/libssl.a") && bootstrap.includes("lib/libcrypto.a") && bootstrap.includes("bin/openssl version"), "Bootstrap must verify static artifacts and the executable version receipt.");

const bootstrapCall = setup.indexOf('bash "$SCRIPT_DIR/bootstrap-hermes-openssl.sh"');
const installCall = setup.indexOf("uv pip install");
assert(bootstrapCall >= 0 && installCall >= 0 && bootstrapCall < installCall, "Intel OpenSSL verification/bootstrap must happen before FCC installation.");
assert(setup.includes('if [[ -n "${OPENSSL_DIR:-}" ]]'), "Explicit OPENSSL_DIR must be verified, not silently trusted.");
assert(setup.includes('bootstrap-hermes-openssl.sh" --verify'), "Explicit OPENSSL_DIR must pass the same pinned verification contract.");
assert(setup.includes("OPENSSL_STATIC=1"), "FCC source builds must be pointed at the isolated static OpenSSL.");

assert(docs.includes("OpenSSL 3.5.4"), "Runtime documentation must record the pinned OpenSSL version.");
assert(docs.includes("967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99"), "Runtime documentation must record the reviewed OpenSSL SHA-256.");
assert(/without (?:installing|requiring) Homebrew|does not (?:use|require|modify).*Homebrew/i.test(docs), "Runtime documentation must preserve the no-Homebrew/no-system-modification boundary.");

assert(workflow.includes("scripts/ai/bootstrap-hermes-openssl.sh"), "Router workflow must watch and syntax-check the OpenSSL bootstrap.");
assert(workflow.includes("scripts/codex-hermes-openssl-bootstrap.test.mjs"), "Router workflow must execute the pinned OpenSSL contract test.");

console.log("Hermes Intel macOS pinned OpenSSL bootstrap contract passed.");
