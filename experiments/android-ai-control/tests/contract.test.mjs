import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const code = read('../app/src/main/java/us/hermeslogistics/aicontrol/MainActivity.java');
const manifest = read('../app/src/main/AndroidManifest.xml');
const gradle = read('../app/build.gradle');
test('No phone permissions, WebView, agent execution or credential capture', () => {
  assert.doesNotMatch(manifest, /uses-permission|INTERNET|QUERY_ALL_PACKAGES/i);
  assert.doesNotMatch(code, /WebView|android\.webview|fetch\(|HttpURLConnection|Runtime\.getRuntime|ProcessBuilder|tokenInput|passwordInput/);
  assert.match(code, /Intent\.ACTION_VIEW/);
  assert.match(code, /CATEGORY_BROWSABLE/);
  assert.match(manifest, /usesCleartextTraffic="false"/);
});
test('only approved HTTPS host origins are launched', () => {
  assert.match(code, /"https"\.equalsIgnoreCase/);
  assert.match(code, /parsed\.getUserInfo\(\) != null/);
  assert.match(code, /parsed\.getQuery\(\) != null/);
  assert.match(code, /parsed\.getFragment\(\) != null/);
  assert.match(code, /parsed\.getPort\(\) > 0/);
});
test('min SDK targets modern Android and artifact cannot be mistaken for production', () => {
  assert.match(gradle, /minSdk 26/);
  assert.match(gradle, /targetSdk 35/);
  assert.match(gradle, /0\.1\.0-preview/);
  assert.match(manifest, /allowBackup="false"/);
});
