import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const root=process.cwd();
const manifestPath=path.join(root,"src/data/hermes-5000-microtask-matrix-20261028.json");
assert.ok(fs.existsSync(manifestPath),"5000-microtask manifest missing");
const m=JSON.parse(fs.readFileSync(manifestPath,"utf8"));

assert.equal(m.schema_version,"1.0.0");
assert.equal(m.as_of,"2026-10-28");
assert.equal(m.artifact_count,200);
assert.equal(m.checks_per_artifact,25);
assert.equal(m.expected_microtasks,5000);
assert.equal(m.task_id_range,"M0001..M5000");
assert.equal(m.no_live_write,true);
assert.equal(m.no_second_control_plane,true);
assert.equal(m.no_paid_fallback,true);
assert.equal(m.artifacts.length,200);
assert.equal(m.checks.length,25);

const paths=m.artifacts.map(a=>a.path);
const ranks=m.artifacts.map(a=>a.rank);
assert.equal(new Set(paths).size,200,"artifact paths must be unique");
assert.equal(new Set(ranks).size,200,"artifact ranks must be unique");

const taskIds=[];
const failures=[];
const pass=(id,ok,msg)=>{ if(!ok) failures.push(`${id}: ${msg}`); };

for(const a of m.artifacts){
  const abs=path.join(root,a.path);
  let raw=Buffer.alloc(0);
  let text="";
  let stat=null;
  if(fs.existsSync(abs)){
    raw=fs.readFileSync(abs);
    text=raw.toString("utf8");
    stat=fs.statSync(abs);
  }
  const checks=[
    typeof a.path==="string" && a.path.length>0,
    !a.path.includes("\\"),
    !path.isAbsolute(a.path),
    path.posix.normalize(a.path)===a.path,
    !a.path.split("/").includes(".."),
    a.path.startsWith("docs/") || a.path.startsWith("ai-collaboration/"),
    a.path.endsWith(".md"),
    path.posix.basename(a.path).length>3 && path.posix.basename(a.path)!==".md",
    a.path.trim()===a.path,
    /^[0-9a-f]{40}$/.test(a.blob_sha),
    Number.isInteger(a.size),
    a.size>0,
    a.size<=200000,
    Number.isInteger(a.rank) && a.rank>=1 && a.rank<=200,
    paths.filter(p=>p===a.path).length===1,
    ranks.filter(r=>r===a.rank).length===1,
    fs.existsSync(abs),
    Boolean(stat?.isFile()),
    raw.length===a.size,
    crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${raw.length}\0`),raw])).digest("hex")===a.blob_sha,
    !raw.includes(0),
    Buffer.from(text,"utf8").equals(raw),
    text.trim().length>0,
    !text.includes("\uFFFD"),
    !text.includes("<<<<<<< ") && !text.includes(">>>>>>> ")
  ];
  assert.equal(checks.length,25);
  for(let c=1;c<=25;c++){
    const n=((a.rank-1)*25)+c;
    const id=`M${String(n).padStart(4,"0")}`;
    taskIds.push(id);
    pass(id,checks[c-1],`${a.path} failed ${m.checks[c-1].key}`);
  }
}

assert.equal(taskIds.length,5000);
assert.equal(new Set(taskIds).size,5000);
assert.equal(taskIds[0],"M0001");
assert.equal(taskIds.at(-1),"M5000");

if(failures.length){
  console.error(JSON.stringify({status:"FAIL",failed:failures.length,total:5000,sample:failures.slice(0,100)},null,2));
  process.exit(1);
}
console.log(JSON.stringify({
  status:"PASS",
  artifacts:200,
  checks_per_artifact:25,
  microtasks_closed:5000,
  first_task:"M0001",
  last_task:"M5000",
  source_head:m.source_head
},null,2));
