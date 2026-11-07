#!/usr/bin/env python3
"""Hermes AI: bounded real production conversion QA, read-only.
Called by the EXISTING local Hermes AI worker. Never submits forms, logs in,
publishes, creates issues, sends messages or changes provider accounts.
"""
import argparse, datetime, hashlib, html, json, os, pathlib, re, urllib.error, urllib.parse, urllib.request
from html.parser import HTMLParser
from zoneinfo import ZoneInfo

ROOT=pathlib.Path(__file__).resolve().parent
RUN=ROOT/"viktor_live"/"operations"
HOST="https://hermeslogisticsus.com"
KYIV=ZoneInfo("Europe/Kyiv")
CASES=(
 ("marketing_inquiry","/paths/marketing/","#contact",True),
 ("academy_application","/paths/academy/","/academy/apply/",True),
 ("technology_project","/paths/technology/","#project-brief",True),
 ("dispatch_inquiry","/logistics/car-hauling-dispatch/","/logistics/start-car-hauling-dispatch/",True),
 ("carrier_onboarding","/logistics/carrier/","/carrier/",True),
 ("load_board_access","/load-board/","/services/hermes-connect/load-board/access/",True),
)
# Compatibility routes may intentionally resolve to a different canonical owner.
# Keep the user journey test on the legacy entry, but compare canonical against
# current source truth rather than the requested URL.
CANONICAL_OWNER_OVERRIDES={
 "/logistics/carrier/":"/logistics/car-hauling-dispatch/",
}
class Scan(HTMLParser):
 def __init__(self):
  super().__init__();self.links=[];self.ids=set();self.canonical=[];self.robots=[]
  self.title="";self.h1=0;self.in_title=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if a.get("id"):self.ids.add(a["id"])
  if t=="a" and a.get("href"):self.links.append(a["href"])
  if t=="link" and "canonical" in a.get("rel","").lower():self.canonical.append(a.get("href",""))
  if t=="meta" and a.get("name","").lower()=="robots":self.robots.append(a.get("content",""))
  if t=="h1":self.h1+=1
  if t=="title":self.in_title=True
 def handle_endtag(self,t):
  if t=="title":self.in_title=False
 def handle_data(self,content):
  if self.in_title:self.title+=content
def inspect_markup(raw,path,cta):
 doc=Scan();doc.feed(raw)
 expected=HOST+CANONICAL_OWNER_OVERRIDES.get(path,path)
 missing=[]
 if not doc.title.strip():missing.append("NO_TITLE")
 if doc.h1==0:missing.append("NO_H1")
 if expected not in doc.canonical:missing.append("CANONICAL_NOT_EXPECTED")
 if any("noindex" in r.lower() for r in doc.robots):missing.append("UNEXPECTED_NOINDEX")
 if cta not in doc.links:missing.append("CTA_HREF_ABSENT")
 if cta.startswith("#") and cta[1:] not in doc.ids:missing.append("CTA_ANCHOR_MISSING")
 return {"status":"PASS" if not missing else "REVIEW_REQUIRED","missing":missing,
  "cta":cta,"canonical_found":expected in doc.canonical,
  "title_present":bool(doc.title.strip()),"h1_count":doc.h1,
  "anchor_count":len(doc.links),"html_sha256":hashlib.sha256(raw.encode()).hexdigest()}
def fetch(path):
 url=HOST+path
 req=urllib.request.Request(url,headers={
  "User-Agent":"HermesProductionCtaSmoke/1.0",
  "Accept":"text/html","Cache-Control":"no-cache"})
 try:
  with urllib.request.urlopen(req,timeout=12) as response:
   if urllib.parse.urlparse(response.geturl()).netloc!="hermeslogisticsus.com":
    return {"result":"HOLD_EXTERNAL_REDIRECT","code":response.status}
   content=response.read(700000)
   if len(content)>=700000:return {"result":"HOLD_OVERSIZE","code":response.status}
   return {"result":"FETCHED","code":response.status,
    "html":content.decode("utf-8","replace")}
 except urllib.error.HTTPError as e:
  if e.code in (401,403,429,500,502,503,504):
   return {"result":"EVIDENCE_ACCESS_GAP","code":e.code}
  return {"result":"HTTP_FAILURE","code":e.code}
 except Exception as e:return {"result":"EVIDENCE_ACCESS_GAP","error_type":type(e).__name__}
def examine(cases=CASES,fetcher=fetch):
 rows=[];destinations={}
 for ident,path,cta,index in cases:
  reply=fetcher(path)
  row={"case_id":ident,"page":path,"cta":cta,"http":reply.get("code"),
       "fetched_status":reply["result"],"outcome":"UNKNOWN","missing":[]}
  if reply["result"]=="FETCHED" and reply.get("code")==200:
   d=inspect_markup(reply["html"],path,cta)
   row.update({k:d[k] for k in ("missing","title_present","h1_count","canonical_found","html_sha256")})
   row["outcome"]=d["status"]
   if d["status"]=="PASS" and cta.startswith("/"):
    dest_path=cta.split("?")[0].split("#")[0]
    if dest_path not in destinations:
     dest=fetcher(dest_path)
     destinations[dest_path]={"http":dest.get("code"),"result":dest["result"]}
    row["destination"]=destinations[dest_path]
    if destinations[dest_path]["result"]=="HTTP_FAILURE":
     row["outcome"]="CTA_DESTINATION_BROKEN"
    elif destinations[dest_path]["result"]!="FETCHED":
     row["outcome"]="UNKNOWN_DESTINATION_ACCESS"
  elif reply["result"]=="HTTP_FAILURE":
   row["outcome"]="PAGE_HTTP_FAILURE"
  else:row["outcome"]="EVIDENCE_ACCESS_GAP"
  rows.append(row)
 return rows
def run_once(force=False):
 now=datetime.datetime.now(KYIV)
 slot=("MORNING" if 7<=now.hour<12 else "MIDDAY" if 12<=now.hour<18 else "EVENING" if 18<=now.hour<22 else "MANUAL")
 RUN.mkdir(parents=True,exist_ok=True)
 stampfile=RUN/"last_public_conversion_qa.json"
 if stampfile.exists() and not force:
  try:
   latest=json.loads(stampfile.read_text())
   at=datetime.datetime.fromisoformat(latest["finished_at"])
   if at.astimezone(KYIV).date()==now.date() and latest.get("slot")==slot:
    return {"result":"SKIPPED_ALREADY_CHECKED_THIS_SLOT","run_date":str(now.date()),"slot":slot}
  except (ValueError,KeyError):pass
 rows=examine()
 report={"kind":"HERMES_AI_REAL_PUBLIC_CONVERSION_QA","finished_at":now.isoformat(),"slot":slot,
  "mode":"PROVIDER_READ_ONLY","scope":"public_html_6_pages_no_form_submission",
  "provider_writes":0,"total":len(rows),"passed":sum(r["outcome"]=="PASS" for r in rows),
  "actionable":sum(r["outcome"] in ("REVIEW_REQUIRED","CTA_DESTINATION_BROKEN","PAGE_HTTP_FAILURE") for r in rows),
  "unknown":sum(r["outcome"] in ("EVIDENCE_ACCESS_GAP","UNKNOWN_DESTINATION_ACCESS") for r in rows),
  "rows":rows,"next_action":"For any REVIEW_REQUIRED, compare latest exact live HTML to canonical source; do not open duplicate issue or merge without owner QA."}
 blob=json.dumps(report,ensure_ascii=False,sort_keys=True,indent=2)+"\n"
 temp=RUN/"latest.qa.tmp";temp.write_text(blob);os.replace(temp,stampfile)
 flagged=[r for r in rows if r["outcome"]!="PASS"]
 previous_file=RUN/"last_finding_fingerprint.txt"
 fingerprint=hashlib.sha256(json.dumps([(r["case_id"],r["outcome"],r["missing"]) for r in flagged],sort_keys=True).encode()).hexdigest()
 old=previous_file.read_text().strip() if previous_file.exists() else ""
 if fingerprint!=old:
  from hermes_ai_self_learning import append
  append(RUN/"findings.jsonl",{"at":now.isoformat(),"fingerprint":fingerprint,
    "status":"PROPOSALS_ONLY","findings":flagged,"external_actions":0})
  tmp=RUN/"fingerprint.tmp";tmp.write_text(fingerprint+"\n");os.replace(tmp,previous_file)
 return {"result":"CHECK_COMPLETED","passed":report["passed"],"actionable":report["actionable"],"unknown":report["unknown"],"report":str(stampfile)}
def selftest():
 raw='''<html><head><title>Carrier</title><link rel="canonical" href="https://hermeslogisticsus.com/logistics/car-hauling-dispatch/"></head><body><h1>Dispatch</h1><a href="/carrier/">Carrier packet</a></body></html>'''
 result=inspect_markup(raw,"/logistics/carrier/","/carrier/")
 assert result["status"]=="PASS", result
 assert result["canonical_found"] is True
 print("HERMES_AI_OPERATIONAL_QA_SELFTEST_PASS canonical_compatibility_owner")
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--run-now",action="store_true");p.add_argument("--self-test",action="store_true");a=p.parse_args()
 if a.self_test:selftest()
 else:print(json.dumps(run_once(force=a.run_now),ensure_ascii=False))