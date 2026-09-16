// Delete Telegram-derived private content when the authenticated owner revokes the connector.
// Keep only the minimal hc_connections tombstone plus a new sanitized revoke audit receipt.
export async function purgeTelegramConnectionData(db, connectionId) {
  const deletes = [
    "DELETE FROM hc_knowledge_items WHERE connection_id = ?",
    "DELETE FROM hc_messages WHERE connection_id = ?",
    "DELETE FROM hc_raw_events WHERE connection_id = ?",
    "DELETE FROM hc_checkpoints WHERE connection_id = ?",
    "DELETE FROM hc_sync_runs WHERE connection_id = ?",
    "DELETE FROM hc_dead_letters WHERE connection_id = ?",
    "DELETE FROM hc_sources WHERE connection_id = ?",
    "DELETE FROM hc_connection_verifiers WHERE connection_id = ?",
    "DELETE FROM hc_audit_events WHERE connection_id = ?",
  ];
  for (const sql of deletes) await db.prepare(sql).bind(connectionId).run();
}
