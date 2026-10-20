import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const read = name => readFileSync(new URL(name,import.meta.url),'utf8');
const code=read('src/main.jsx'); const page=read('index.html'); const pkg=JSON.parse(read('package.json'));
test('isolated from production site and nonindexable',()=>{
 assert.match(page,/noindex,nofollow,noarchive/);
 assert.equal(pkg.private,true);
 assert.equal(pkg.dependencies['@designcodeio/threeui'],'1.2.0');
 assert.doesNotMatch(code,/\/api\/|fetch\(|localStorage|sessionStorage/);
});
test('reduced-motion, save-data and WebGL are gated',()=>{
 assert.match(code,/prefers-reduced-motion: reduce/);
 assert.match(code,/connection\?\.saveData/);
 assert.match(code,/getContext\('webgl'\)/);
 assert.match(code,/Activate WebGL preview/);
});
test('real ThreeUI Community subpath imports, not invented placeholders',()=>{
 assert.match(code,/@designcodeio\/threeui\/components\/EmeraldHorizonBackground/);
 assert.match(code,/@designcodeio\/threeui\/components\/DotMatrixBackground/);
 assert.match(code,/setActive\(false\)/);
});
