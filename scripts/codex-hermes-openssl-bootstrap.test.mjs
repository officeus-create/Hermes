import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [bootstrap, setup, runtimeDoc] = await Promise.all([
  readFile(new URL("./ai/bootstrap-hermes-openssl.sh", import.meta.url), "utf8"),
  readFile(new URL("./ai/setup-codex-hermes.sh", import.meta.url), "utf8"),
  readFile(new URL("../docs/CODEX_HERMES_RUNTIME.md", import.meta.url), "utf8"),
]);

assert.match(bootstrap, /OPENSSL_VERSION="3\.5\.4"/);
assert.match(bootstrap, /OPENSSL_SHA256="967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99"/);
assert.match(bootstrap, /https:\/\/www\.openssl\.org\/source\//);
assert.match(bootstrap, /curl --fail --location --proto '=https' --tlsv1\.2/);
assert.match(bootstrap, /shasum -a 256/);
assert.match(bootstrap, /darwin64-x86_64-cc no-shared no-tests/);
assert.match(bootstrap, /--verify/);
assert.match(bootstrap, /Refusing to use a system or package-manager OpenSSL path/);
assert.match(bootstrap, /libssl\.a/);
assert.match(bootstrap, /libcrypto\.a/);
assert.match(bootstrap, /OpenSSL \$OPENSSL_VERSION/);

assert.match(setup, /bootstrap-hermes-openssl\.sh" --verify/);
assert.match(setup, /bootstrap-hermes-openssl\.sh"/);
assert.match(setup, /OPENSSL_STATIC=1/);
assert.match(runtimeDoc, /openssl-3\.5\.4\.tar\.gz/);
assert.match(runtimeDoc, /967311f84955316969bdb1d8d4b983718ef42338639c621ec4c34fddef355e99/);
assert.match(runtimeDoc, /never invokes Homebrew or modifies macOS OpenSSL/);

console.log("Codex Hermes isolated OpenSSL bootstrap contract passed.");
