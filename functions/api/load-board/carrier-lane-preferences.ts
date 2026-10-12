import { getAuthenticatedSpecialist, jsonResponse } from "../_lib/session.mjs";
import {
  authorizedCarrier, ensureCarrierDispatchWorkspaceSchema,
  privateWorkspaceHeaders, workspaceSameOrigin,
} from "../_lib/carrier-dispatch-workspace.mjs";

type Context = {request: Request; env: {DB?: any}};
const reply = (status: number, data: Record<string, unknown>) => jsonResponse(status, data, privateWorkspaceHeaders);
const ALLOWED_EQUIPMENT = new Set(["", "car_hauler", "hotshot", "flatbed", "enclosed", "wedge"]);
const US_STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
function parseState(input: unknown): string | null | undefined {
  if(input === null || input === undefined || input === "") return null;
  if(typeof input !== "string") return undefined;
  const value = input.trim().toUpperCase();
  return US_STATES.has(value) ? value : undefined;
}
function parseEquipment(input: unknown): string | null | undefined {
  if(input === null || input === undefined || input === "") return null;
  if(typeof input !== "string") return undefined;
  const value = input.trim().toLowerCase();
  return ALLOWED_EQUIPMENT.has(value) && value ? value : undefined;
}
function parseSlots(input: unknown): number | null | undefined {
  if(input === null || input === undefined || input === "") return null;
  if(typeof input !== "number" || !Number.isInteger(input) || input < 1 || input > 16) return undefined;
  return input;
}
async function session(context: Context) {
  const db = context.env.DB;
  if(!db) return {error: reply(503, {success:false,error:"database_not_configured"})};
  const specialist = await getAuthenticatedSpecialist(context.request, db);
  if(!specialist) return {error:reply(401,{success:false,error:"authentication_required"})};
  const company = await authorizedCarrier(db, specialist);
  if(!company) return {error:reply(403,{success:false,error:"verified_carrier_access_required"})};
  await ensureCarrierDispatchWorkspaceSchema(db);
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS hermes_carrier_lane_preferences (
      carrier_company_id TEXT PRIMARY KEY,
      origin_state TEXT,
      destination_state TEXT,
      equipment TEXT,
      available_slots INTEGER,
      updated_by_specialist_id TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  return {company,specialist,db};
}
function publicPreferences(row: any) {
  return {
    originState: row?.origin_state || null,
    destinationState: row?.destination_state || null,
    equipment: row?.equipment || null,
    availableSlots: row?.available_slots == null ? null : Number(row.available_slots),
    updatedAt: row?.updated_at || null,
  };
}
export async function onRequestGet(context: Context) {
  const auth = await session(context);if(auth.error)return auth.error;
  const row=await auth.db.prepare(`
    SELECT origin_state,destination_state,equipment,available_slots,updated_at
    FROM hermes_carrier_lane_preferences WHERE carrier_company_id=? LIMIT 1
  `).bind(auth.company.id).first();
  return reply(200,{success:true,preferences:publicPreferences(row),
    matcher:"state_and_equipment_planning_only",bookingCreated:false,alertsSent:false});
}
export async function onRequestPost(context: Context) {
  if(!workspaceSameOrigin(context.request))return reply(403,{success:false,error:"same_origin_required"});
  const auth=await session(context);if(auth.error)return auth.error;
  let body: Record<string,unknown>;
  try {body=await context.request.json() as Record<string,unknown>;}
  catch {return reply(400,{success:false,error:"invalid_json"})}
  const originState=parseState(body.originState),destinationState=parseState(body.destinationState);
  const equipment=parseEquipment(body.equipment),availableSlots=parseSlots(body.availableSlots);
  if([originState,destinationState,equipment,availableSlots].some(x=>x===undefined)) {
    return reply(400,{success:false,error:"invalid_lane_preference",details:
      "Use two-letter US states, supported equipment or 1–16 available slots. Blank clears a field."});
  }
  const updatedAt=new Date().toISOString();
  await auth.db.prepare(`
    INSERT INTO hermes_carrier_lane_preferences
      (carrier_company_id,origin_state,destination_state,equipment,available_slots,
       updated_by_specialist_id,updated_at)
    VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(carrier_company_id) DO UPDATE SET
      origin_state=excluded.origin_state,
      destination_state=excluded.destination_state,
      equipment=excluded.equipment,
      available_slots=excluded.available_slots,
      updated_by_specialist_id=excluded.updated_by_specialist_id,
      updated_at=excluded.updated_at
  `).bind(auth.company.id,originState,destinationState,equipment,availableSlots,auth.specialist.id,updatedAt).run();
  return reply(200,{success:true,
    preferences:publicPreferences({origin_state:originState,destination_state:destinationState,equipment,
      available_slots:availableSlots,updated_at:updatedAt}),
    recommendationsOnly:true,bookingCreated:false,alertsSent:false,sourceContacted:false});
}
