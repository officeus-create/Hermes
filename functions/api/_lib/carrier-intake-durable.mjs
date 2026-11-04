// Existing Hermes Connect D1 owns this private carrier intake record.
// No second CRM, mailbox, outbound transport or public read surface is created.
// Capture remains disabled unless CARRIER_INTAKE_CAPTURE_MODE=capture_only is explicitly configured.
const classifications = new Set(["commercial", "qa"]);

export function parseCarrierIntakeRetentionDays(value) {
  const raw=String(value ?? "").trim();
  if(!/^\d{1,3}$/.test(raw)) return null;
  const days=Number(raw);
  // Data minimization bound only. The actual value is an owner/privacy policy decision.
  if(!Number.isInteger(days) || days < 1 || days > 365) return null;
  return days;
}

export async function readCarrierIntake(db, requestId) {
  return db.prepare(
    "SELECT request_id,payload_hash,classification,delivery_state,retention_until FROM hermes_carrier_intake WHERE request_id = ? LIMIT 1"
  ).bind(requestId).first();
}

export async function persistCarrierIntake(db, input) {
  if(!classifications.has(input.classification)) throw new Error("invalid_carrier_classification");
  if(!Number.isInteger(input.retentionDays) || input.retentionDays < 1 || input.retentionDays > 365)
    throw new Error("invalid_carrier_retention");

  const existing=await readCarrierIntake(db,input.requestId);
  if(existing) return {created:false,conflict:existing.payload_hash!==input.payloadHash,row:existing};

  const createdAt=new Date();
  const retentionUntil=new Date(createdAt.getTime()+input.retentionDays*86400000).toISOString();
  let inserted=false;
  try {
    const result=await db.prepare(`INSERT OR IGNORE INTO hermes_carrier_intake
      (request_id,payload_hash,classification,source_path,contact_email,email_body,created_at,retention_until)
      VALUES(?,?,?,?,?,?,?,?)`)
      .bind(input.requestId,input.payloadHash,input.classification,input.sourcePath,
        input.contactEmail,input.emailBody,createdAt.toISOString(),retentionUntil).run();
    inserted=Number(result?.meta?.changes||0)===1;
  } catch(error) {
    const raced=await readCarrierIntake(db,input.requestId).catch(()=>null);
    if(!raced) throw error;
  }
  const row=await readCarrierIntake(db,input.requestId);
  if(!row) throw new Error("carrier_capture_not_persisted");
  return {created:inserted,conflict:row.payload_hash!==input.payloadHash,row};
}
