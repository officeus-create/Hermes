import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
const dirs=["ig-reel","ig-viral","ig-caption","ig-carousel","ig-story","ig-profile","ig-plan","ig-human","ig-comment","ig-reply","ig-dm","ig-repurpose","ig-audit"];
for (const dir of dirs) {
 const p=`.claude/skills/${dir}/SKILL.md`, s=fs.readFileSync(p,"utf8");
 assert.match(s,/Hermes account and publication controls/,`policy missing: ${dir}`);
 assert.match(s,/ACCOUNT_UNVERIFIED/,`identity guard missing: ${dir}`);
 assert.match(s,/No posting, ads, account changes/,`external-write guard missing: ${dir}`);
 assert.doesNotMatch(s,/~\/\.claude\/instagram\//,`global workspace leaked: ${dir}`);
 assert.match(s,/~\/\.hermes-social\//,`brand isolation missing: ${dir}`);
}
const assets=["ig-reel/beats.py","ig-reel/hookscore.py","ig-reel/hooks.json","ig-viral/swipe.py","ig-caption/caption.py","ig-human/detect.py","ig-human/humanize.py","ig-human/slop.json","ig-profile/rubric.json"];
for(const a of assets)assert.ok(fs.existsSync(`.claude/skills/${a}`),`missing tool ${a}`);
assert.ok(fs.readFileSync(".claude/skills/INSTAGRAM_DONOR_LICENSE","utf8").includes("MIT License"));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"hermes-ig-test-"));
function smoke(file,args) {
 const result=spawnSync("python3",[`.claude/skills/${file}`,...args],{encoding:"utf8",timeout:10000});
 assert.ok([0,1].includes(result.status),`${file}: ${result.stderr}\n${result.stdout}`);
 assert.ok(result.stdout.trim().length > 20,`${file}: no validation report`);
 assert.doesNotMatch(result.stderr,/Traceback|ModuleNotFoundError|SyntaxError/,`${file}: Python runtime failure`);
}
try {
 fs.writeFileSync(path.join(tmp,"reel.txt"),"We talked to three carriers this week. Each asked for clear pickup terms. Here is how we explain them without promising a rate.");
 fs.writeFileSync(path.join(tmp,"caption.txt"),"Three common carrier questions: pickup time, load terms, and who confirms details. Ask for the checklist.");
 smoke("ig-reel/hookscore.py",["--hook","Three carrier questions cost drivers time if unanswered"]);
 smoke("ig-reel/beats.py",[path.join(tmp,"reel.txt"),"--target","30"]);
 smoke("ig-caption/caption.py",[path.join(tmp,"caption.txt")]);
 smoke("ig-human/detect.py",[path.join(tmp,"caption.txt")]);
 smoke("ig-human/humanize.py",[path.join(tmp,"caption.txt"),"--report"]);
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
console.log("PASS: 13 account-isolated skills, license, all offline tools and five Python smoke checks");
