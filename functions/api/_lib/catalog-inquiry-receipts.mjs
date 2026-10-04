const kinds = new Set(['internal','owner']);
export const recipientFingerprint = async (key,identity,email) => {
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${key}:${identity}:${email.toLowerCase().trim()}`));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
};
export async function readReceipts(db,id) {
 // Legacy pending/failed rows cannot prove non-acceptance. Never bulk resend them.
 await db.batch(['internal','owner'].map(kind=>db.prepare(`INSERT OR IGNORE INTO catalog_inquiry_delivery_receipts
  (request_id,recipient_kind,state,error_code,updated_at)
  SELECT request_id,?,CASE WHEN ${kind}_delivery_status='delivered' THEN 'accepted'
   ${kind==='owner'?"WHEN owner_delivery_status='skipped' THEN 'skipped'":''} ELSE 'uncertain' END,
   CASE WHEN ${kind}_delivery_status IN ('pending','failed') THEN 'legacy_result_unverified' ELSE NULL END,updated_at
  FROM catalog_business_inquiries WHERE request_id=?`).bind(kind,id)));
 const rows=(await db.prepare('SELECT * FROM catalog_inquiry_delivery_receipts WHERE request_id=?').bind(id).all()).results;
 return Object.fromEntries(rows.map(row=>[row.recipient_kind,row]));
}
export async function resolveStoredOwner(db,row) {
 return db.prepare(`SELECT s.email,s.id FROM repair_shops r JOIN specialists s ON s.id=r.owner_specialist_id
 WHERE r.id=? AND r.owner_specialist_id=? AND r.catalog_email_notifications_opt_in=1 AND s.role='Shop Owner'`)
 .bind(row.shop_id,row.owner_specialist_id).first();
}
export async function skipUnsentOwner(db,id) {
 await db.batch([
  db.prepare(`UPDATE catalog_business_inquiries SET owner_delivery_status='skipped',updated_at=?
    WHERE request_id=? AND EXISTS(SELECT 1 FROM catalog_inquiry_delivery_receipts WHERE request_id=? AND recipient_kind='owner' AND state IN ('ready','failed'))`).bind(new Date().toISOString(),id,id),
  db.prepare(`UPDATE catalog_inquiry_delivery_receipts SET state='skipped',error_code='owner_not_eligible',updated_at=? WHERE request_id=? AND recipient_kind='owner' AND state IN ('ready','failed') AND attempt_token IS NULL`).bind(new Date().toISOString(),id)
 ]);
}
export async function claimReceipt(db,row,kind,fingerprint,email='') {
 if(!kinds.has(kind)) throw new Error('invalid_recipient_kind');
 const token=crypto.randomUUID(),now=new Date().toISOString();
 const guard=kind==='owner'?` AND EXISTS(SELECT 1 FROM repair_shops r JOIN specialists s ON s.id=r.owner_specialist_id
 WHERE r.id=? AND r.owner_specialist_id=? AND r.catalog_email_notifications_opt_in=1 AND s.role='Shop Owner' AND LOWER(TRIM(s.email))=?)`:'';
 const args=[token,now,now,fingerprint,row.request_id,kind,fingerprint,...(kind==='owner'?[row.shop_id,row.owner_specialist_id,email]:[])];
 const result=await db.prepare(`UPDATE catalog_inquiry_delivery_receipts SET state='sending',attempt_token=?,attempt_count=attempt_count+1,
 attempted_at=?,updated_at=?,recipient_fingerprint=COALESCE(recipient_fingerprint,?),error_code=NULL
 WHERE request_id=? AND recipient_kind=? AND state IN ('ready','failed') AND attempt_token IS NULL
 AND (recipient_fingerprint IS NULL OR recipient_fingerprint=?)${guard}`).bind(...args).run();
 return result.meta?.changes===1 ? token : null;
}
export async function settleReceipt(db,id,kind,token,result) {
 if(!kinds.has(kind)||!['accepted','failed','uncertain'].includes(result.state))throw new Error('invalid_receipt_state');
 const now=new Date().toISOString(),projection=result.state==='accepted'?'delivered':result.state==='failed'?'failed':'pending';
 await db.batch([
  db.prepare(`UPDATE catalog_business_inquiries SET ${kind}_delivery_status=?,updated_at=?
    ${kind==='owner'?",owner_delivery_at=CASE WHEN ?='delivered' THEN ? ELSE owner_delivery_at END":''}
    WHERE request_id=? AND EXISTS(SELECT 1 FROM catalog_inquiry_delivery_receipts WHERE request_id=? AND recipient_kind=? AND state='sending' AND attempt_token=?)`)
   .bind(projection,now,...(kind==='owner'?[projection,now]:[]),id,id,kind,token),
  db.prepare(`UPDATE catalog_inquiry_delivery_receipts SET state=?,attempt_token=NULL,recipient_fingerprint=COALESCE(recipient_fingerprint,?),provider_message_id=?,error_code=?,
    accepted_at=CASE WHEN ?='accepted' THEN ? ELSE accepted_at END,updated_at=?
    WHERE request_id=? AND recipient_kind=? AND state='sending' AND attempt_token=?`)
   .bind(result.state,result.fingerprint||null,result.providerMessageId||null,result.errorCode||null,result.state,now,now,id,kind,token)
 ]);
}
