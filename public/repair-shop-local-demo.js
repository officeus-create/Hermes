/* Local-only CRM demonstration data. It never runs on a public hostname and never
   forwards demo mutations to the real API. It exists so a complete workflow can
   be reviewed before an owner chooses to enter real operational data. */
(() => {
  const local = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const demo = new URLSearchParams(window.location.search).get("demo") === "1";
  if (!local || !demo) return;

  const now = new Date();
  const iso = (offset) => { const day = new Date(now); day.setDate(day.getDate() + offset); return day.toISOString().slice(0, 10); };
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const services = [
    ["svc-diagnostics", "Vehicle diagnostics", 60], ["svc-oil", "Oil & filter service", 45],
    ["svc-brakes", "Brake inspection", 75], ["svc-tires", "Tire service", 60],
    ["svc-ac", "A/C inspection", 60], ["svc-dot", "DOT / pre-trip inspection", 90],
  ].map(([id, name, duration_minutes]) => ({ id, name, duration_minutes, owner_specialist_id: "demo-owner" }));
  const names = ["Alex Morgan", "Jordan Lee", "Taylor Rivera", "Casey Bennett", "Morgan Patel", "Riley Chen", "Jamie Brooks", "Avery Stone", "Cameron Diaz", "Drew Parker", "Quinn Harper", "Skyler Reed"];
  const makes = [["Ford", "Transit"], ["Chevrolet", "Express"], ["Ram", "ProMaster"], ["Freightliner", "M2"], ["Toyota", "Tacoma"], ["Honda", "Civic"]];
  // Fictional records give the local demo a small history and a complete month ahead.
  const bookings = Array.from({ length: 40 }, (_, index) => {
    const [make, model] = makes[index % makes.length]; const customer = names[index % names.length];
    const service = services[index % services.length]; const offset = index - 9;
    const status = offset < -2 ? "completed" : offset < 1 ? "in_progress" : "confirmed";
    const start = `${String(8 + (index % 7)).padStart(2, "0")}:00`;
    const duration = service.duration_minutes; const endHour = 8 + (index % 7) + Math.ceil(duration / 60);
    return { id:`demo-booking-${index + 1}`, service_name:service.name, duration_minutes:duration, appointment_date:iso(offset), start_time:start, end_time:`${String(endHour).padStart(2,"0")}:00`, status,
      client_name:customer, client_email:`${customer.toLowerCase().replace(/[^a-z]+/g,".").replace(/\.$/,"")}@demo.invalid`, client_phone:`+1 (555) 010-${String(1000 + index).slice(-4)}`,
      technician:{ id:`tech-${index % 3}`, name:["Sam Miller", "Robin Gray", "Dani Cole"][index % 3] },
      vehicle:{ year:2018 + (index % 7), make, model, mileage:42000 + index * 1275, vin:`DEMO${String(index + 1).padStart(6,"0")}` },
      history:[{ id:`history-${index}-1`, booking_id:`demo-booking-${index + 1}`, from_status:null, to_status:"confirmed", changed_at:`${iso(offset - 3)}T14:00:00.000Z` }, ...(status !== "confirmed" ? [{ id:`history-${index}-2`, booking_id:`demo-booking-${index + 1}`, from_status:"confirmed", to_status:status, changed_at:`${iso(offset)}T15:00:00.000Z` }] : [])],
    };
  });
  const shop = { id:"demo-shop", name:"Northstar Fleet & Auto", slug:"northstar-demo", phone:"+1 (555) 010-0200", address_line1:"1450 Demo Avenue", city:"Milwaukee", state:"WI", postal_code:"53202", timezone:"America/Chicago" };
  const profile = { ...shop };
  const availability = [1,2,3,4,5].map((day_of_week) => ({ day_of_week, is_open:true, start_time:"08:00", end_time:"18:00" })).concat([{ day_of_week:6,is_open:true,start_time:"09:00",end_time:"14:00" },{ day_of_week:0,is_open:false,start_time:null,end_time:null }]);
  let driverDiscount = { enabled:true, service_discount_percent:10, service_scope:"selected", service_ids:["svc-oil","svc-brakes","svc-dot"], materials_discount_percent:5, materials_scope:"selected", materials_items:["Engine oil","Filters","Brake pads"] };
  let feedback = [{ id:"feedback-demo-1", category:"booking", rating:5, message:"Demo record: booking reminders are clear and the service details are easy to find.", created_at:`${iso(-3)}T15:00:00.000Z`, retention_until:iso(177) }];
  const readBody = async (init) => { try { return JSON.parse(init?.body || "{}"); } catch { return {}; } };
  const customers = () => names.map((name, index) => {
    const email = `${name.toLowerCase().replace(/[^a-z]+/g,".").replace(/\.$/,"")}@demo.invalid`;
    const own = bookings.filter((item) => item.client_email === email); const latest = own.filter((item) => item.status === "completed").sort((a,b) => b.appointment_date.localeCompare(a.appointment_date))[0]; const next = own.filter((item) => item.status === "confirmed").sort((a,b) => a.appointment_date.localeCompare(b.appointment_date))[0];
    return { id:`demo-customer-${index + 1}`, name, email, phone:`+1 (555) 010-${String(1000 + index).slice(-4)}`, total_bookings:own.length, completed_visits:own.filter((item) => item.status === "completed").length, cancelled_bookings:0, last_service_date:latest?.appointment_date || null, services:[...new Set(own.map((item) => item.service_name))], next_appointment:next ? { booking_id:next.id, appointment_date:next.appointment_date, start_time:next.start_time, service_name:next.service_name, status:next.status } : null, vehicles:own.slice(0,2).map((item) => ({ ...item.vehicle, id:`demo-vehicle-${item.id}`, last_seen_date:item.appointment_date })) };
  });
  const vehicles = () => customers().flatMap((customer) => customer.vehicles.map((vehicle) => {
    const history = bookings.filter((item) => item.vehicle?.vin === vehicle.vin);
    const next = history.find((item) => item.status === "confirmed");
    return { ...vehicle, total_bookings:history.length, completed_visits:history.filter((item) => item.status === "completed").length, cancelled_bookings:0, last_seen_date:history.at(-1)?.appointment_date || null, last_completed_visit:history.filter((item) => item.status === "completed").at(-1)?.appointment_date || null, next_appointment:next ? { booking_id:next.id, appointment_date:next.appointment_date, start_time:next.start_time, service_name:next.service_name, status:next.status } : null, current_customer:{ name:customer.name,email:customer.email,phone:customer.phone }, customers:[{ name:customer.name,email:customer.email,phone:customer.phone,last_seen_date:history.at(-1)?.appointment_date }], services:[...new Set(history.map((item) => item.service_name))], history:history.map((item) => ({ booking_id:item.id, appointment_date:item.appointment_date, start_time:item.start_time, service_name:item.service_name, status:item.status, mileage:item.vehicle?.mileage || null, customer:{ name:customer.name,email:customer.email,phone:customer.phone } })) };
  }));
  const originalFetch = window.fetch.bind(window);
  const demoBadge = () => {
    if (document.querySelector("[data-local-demo-badge]")) return;
    const badge = document.createElement("div"); badge.dataset.localDemoBadge = "true"; badge.textContent = "LOCAL DEMO · synthetic data"; document.body.append(badge);
    const style = document.createElement("style"); style.textContent = "[data-local-demo-badge]{position:fixed;right:18px;bottom:18px;z-index:9999;padding:8px 11px;border-radius:999px;background:#172033;color:#fff;font:800 11px/1 system-ui;letter-spacing:.08em;box-shadow:0 8px 24px rgba(15,23,42,.22)}"; document.head.append(style);
  };
  const appendDemoToLinks = () => document.querySelectorAll('a[href^="/services/hermes-connect/repair-shops/"]').forEach((node) => { const url = new URL(node.getAttribute("href"), window.location.origin); url.searchParams.set("demo", "1"); node.setAttribute("href", `${url.pathname}${url.search}${url.hash}`); });
  document.addEventListener("DOMContentLoaded", () => { demoBadge(); appendDemoToLinks(); new MutationObserver(appendDemoToLinks).observe(document.body, { childList:true, subtree:true }); }, { once:true });
  window.fetch = async (input, init = {}) => {
    const requestUrl = new URL(typeof input === "string" ? input : input.url, window.location.origin); const path = requestUrl.pathname; const method = String(init.method || "GET").toUpperCase();
    if (!path.startsWith("/api/")) return originalFetch(input, init);
    if (path === "/api/auth/me") return json({ success:true, specialist:{ id:"demo-owner", name:"Demo Shop Owner", email:"owner@demo.invalid", role:"repair_shop_owner" } });
    if (path === "/api/auth/logout") return json({ success:true });
    if (path === "/api/repair-shop/profile") { if (method === "PUT") Object.assign(profile, await readBody(init)); return json({ success:true, shop:clone(profile) }); }
    if (path === "/api/services") { if (method === "POST") { const body = await readBody(init); const service = { id:`svc-local-${services.length+1}`, name:String(body.name || "New service"), duration_minutes:Number(body.duration_minutes || 30), owner_specialist_id:"demo-owner" }; services.push(service); return json({success:true,service}); } return json({ success:true, services:clone(services) }); }
    if (path.startsWith("/api/services/") && method === "DELETE") return json({ success:false, error:"service_has_bookings" }, 409);
    if (path === "/api/repair-shop/availability") { if (method === "PUT") { const body = await readBody(init); availability.splice(0, availability.length, ...(Array.isArray(body.days) ? body.days : availability)); } return json({ success:true, days:clone(availability), timezone:profile.timezone }); }
    if (path === "/api/repair-shop/bookings") return json({ success:true, bookings:clone(bookings) });
    if (/^\/api\/repair-shop\/bookings\/[^/]+\/status$/.test(path) && method === "PATCH") { const body = await readBody(init); const id = path.split("/")[4]; const item = bookings.find((entry) => entry.id === id); if (item && body.status) { item.history.push({ id:`history-update-${Date.now()}`, booking_id:item.id, from_status:item.status, to_status:body.status, changed_at:new Date().toISOString() }); item.status = body.status; } return json({ success:true, booking:clone(item) }); }
    if (path === "/api/repair-shop/customers") return json({ success:true, customers:clone(customers()) });
    if (path === "/api/repair-shop/vehicles") return json({ success:true, vehicles:clone(vehicles()) });
    if (path === "/api/repair-shop/feedback") { if (method === "POST") { const body = await readBody(init); feedback.unshift({ id:`feedback-${Date.now()}`, category:body.category || "other", rating:Number(body.rating || 5), message:String(body.message || "Demo feedback"), created_at:new Date().toISOString(), retention_until:iso(180) }); } return json({success:true,feedback:clone(feedback)}); }
    if (path === "/api/repair-shop/driver-discount") { if (method === "PUT") driverDiscount = { ...driverDiscount, ...(await readBody(init)) }; return json({ success:true, discount:clone(driverDiscount) }); }
    if (path === "/api/repair-shop/capabilities") return json({ success:true, capabilities:{ accepts_walk_ins:true, accepts_fleet:true, accepts_heavy_duty:true, after_hours_dropoff:true, waiting_area:true } });
    if (path === "/api/repair-shop/capacity") return json({ success:true, capacity:{ bays:6, technicians:3, daily_booking_limit:12 } });
    if (path === "/api/repair-shop/access") return json({ success:true, access:{ can_manage_shop:true } });
    if (path === "/api/public/repair-shop") return json({ success:true, shop:clone(profile), services:clone(services), driver_discount:{ ...clone(driverDiscount), service_names:services.filter((entry) => driverDiscount.service_ids.includes(entry.id)).map((entry) => entry.name) } });
    return json({ success:true });
  };
})();
