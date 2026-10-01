import {normalizeBusinessClubCompanyFacts, companySlug, cleanCompanyText} from './hermes-company-profiles.mjs';

const officialDomain='biznes-club-knb.com';
const requiredColumns=['id','owner_specialist_id','company_name','slug','company_type','city','state','website','catalog_opt_in','catalog_status','load_board_access','country_code','public_source_ref','created_at','updated_at'];
const fold=v=>String(v||'').normalize('NFKC').trim().toLocaleLowerCase('uk');
const domain=v=>{try{return new URL(v).hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}};
const conflict=error=>({status:409,body:{success:false,error}});
const receipt=(row,duplicate=false)=>({status:duplicate?200:201,body:{success:true,duplicate,company_id:row.id,ownership_state:'existing_client_identity_selected',company:{id:row.id,companyName:row.company_name,companyType:row.company_type,countryCode:row.country_code,city:row.city,state:row.state,website:row.website,catalogOptIn:Boolean(row.catalog_opt_in),catalogStatus:row.catalog_status,loadBoardAccess:Boolean(row.load_board_access)},readback_path:`/api/internal/client-company?company_id=${encodeURIComponent(row.id)}`}});

export async function provisionKnbCompany(db,operatorId,input) {
  const selectedId=cleanCompanyText(input.client_owner_id,120);
  if(!selectedId||selectedId===operatorId||input.client_identity_confirmed!==true) return {status:400,body:{success:false,error:'existing_client_identity_confirmation_required'}};
  const parsed=normalizeBusinessClubCompanyFacts(input);
  if(!parsed.ok)return {status:400,body:{success:false,error:'invalid_company_facts',errors:parsed.errors}};
  let website;
  try {
    const u=new URL(String(input.website||''));
    if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.hostname.toLowerCase().replace(/^www\./,'')!==officialDomain)throw new Error();
    website='https://biznes-club-knb.com/';
  }catch{return {status:400,body:{success:false,error:'knb_official_website_required'}};}
  if(fold(parsed.facts.companyName)!==fold('Конс на Бі$'))return {status:400,body:{success:false,error:'knb_company_name_required'}};
  // Readiness check only: this endpoint never applies schema or creates identities.
  const columns=(await db.prepare('PRAGMA table_info(hermes_company_profiles)').all()).results||[];
  if(requiredColumns.some(c=>!columns.some(x=>x.name===c)))return {status:503,body:{success:false,error:'canonical_company_schema_not_ready'}};
  const client=await db.prepare('SELECT id FROM specialists WHERE id=? LIMIT 1').bind(selectedId).first();
  if(!client)return {status:404,body:{success:false,error:'existing_client_identity_not_found'}};
  const rows=(await db.prepare('SELECT id,owner_specialist_id,company_name,slug,company_type,city,state,website,country_code,catalog_opt_in,catalog_status,load_board_access,EXISTS(SELECT 1 FROM specialists WHERE id=?) AS selected_identity_exists FROM hermes_company_profiles').bind(selectedId).all()).results||[];
  const byOwner=rows.find(r=>r.owner_specialist_id===selectedId);
  const byIdentity=rows.find(r=>domain(r.website)===officialDomain||fold(r.company_name)===fold(parsed.facts.companyName));
  if(rows.filter(r=>domain(r.website)===officialDomain||fold(r.company_name)===fold(parsed.facts.companyName)).length>1)return conflict('client_company_identity_ambiguous');
  if(byOwner||byIdentity){
    const row=byOwner||byIdentity;
    if(!Number(row.selected_identity_exists))return conflict('client_identity_no_longer_exists');
    const unchanged=row.owner_specialist_id===selectedId&&domain(row.website)===officialDomain&&fold(row.company_name)===fold(parsed.facts.companyName)&&row.company_type==='business_club'&&row.country_code==='UA'&&row.city===parsed.facts.city&&row.state===parsed.facts.state;
    return unchanged?receipt(row,true):conflict('client_company_already_linked_or_conflicting');
  }
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(officialDomain));
  const id='company-client-'+[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  const now=new Date().toISOString(),f=parsed.facts;
  // Deterministic domain ID plus owner UNIQUE make concurrent bounded calls single-create.
  // Existing common URL forms/name also participate in the atomic insertion guard.
  const prefixes=['https://biznes-club-knb.com','http://biznes-club-knb.com','https://www.biznes-club-knb.com','http://www.biznes-club-knb.com'];
  const guards=prefixes.map(()=>'(LOWER(TRIM(website))=? OR LOWER(TRIM(website)) LIKE ? OR LOWER(TRIM(website)) LIKE ?)').join(' OR ');
  const created=await db.prepare(`INSERT OR IGNORE INTO hermes_company_profiles
    (id,owner_specialist_id,company_name,slug,company_type,city,state,website,country_code,public_source_ref,catalog_opt_in,catalog_status,load_board_access,created_at,updated_at)
    SELECT ?,?,?,?,?,?,?,?,?,?,0,'self_submitted',0,?,?
    WHERE EXISTS(SELECT 1 FROM specialists WHERE id=?)
    AND NOT EXISTS(SELECT 1 FROM hermes_company_profiles WHERE owner_specialist_id=? OR LOWER(TRIM(company_name))=LOWER(?) OR ${guards})`)
    .bind(id,selectedId,f.companyName,companySlug(f.companyName,id),f.companyType,f.city,f.state,website,f.countryCode,'https://biznes-club-knb.com/zrostannia-u-biznesi-ads',now,now,selectedId,selectedId,f.companyName,...prefixes.flatMap(p=>[p,p+'/%',p+':%'])).run();
  const row=await db.prepare('SELECT id,owner_specialist_id,company_name,company_type,city,state,website,country_code,catalog_opt_in,catalog_status,load_board_access FROM hermes_company_profiles WHERE id=? AND EXISTS(SELECT 1 FROM specialists WHERE specialists.id=hermes_company_profiles.owner_specialist_id)').bind(id).first();
  if(!row||row.owner_specialist_id!==selectedId||row.city!==f.city||row.state!==f.state||fold(row.company_name)!==fold(f.companyName)||row.company_type!==f.companyType||row.country_code!==f.countryCode)return conflict('client_company_concurrent_conflict');
  return receipt(row,created.meta?.changes!==1);
}
