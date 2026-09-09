(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  if (location.pathname.replace(/\/+$/, "") !== `${ROOT}/appointments`) return;

  const supported = new Set(["en","ru","uk","es","it","fr"]);
  const params = new URLSearchParams(location.search);
  const locale = supported.has((params.get("lang") || "en").toLowerCase()) ? (params.get("lang") || "en").toLowerCase() : "en";
  const lang = {en:"en-US",ru:"ru-RU",uk:"uk-UA",es:"es-ES",it:"it-IT",fr:"fr-FR"}[locale] || "en-US";
  const copy = {
    en:{calendar:"Calendar",day:"Day",week:"Week",month:"Month",agenda:"Agenda",today:"Today",previous:"Previous",next:"Next",technician:"Technician",allTechs:"All technicians",unassigned:"Unassigned",bookingLink:"Customer booking link",copyLink:"Copy link",copied:"Copied",openBooking:"Open booking",google:"Google Calendar",noBookings:"No appointments in this period",appointments:"appointments"},
    ru:{calendar:"Календарь",day:"День",week:"Неделя",month:"Месяц",agenda:"Список",today:"Сегодня",previous:"Назад",next:"Вперёд",technician:"Мастер",allTechs:"Все мастера",unassigned:"Без мастера",bookingLink:"Ссылка для записи клиентов",copyLink:"Копировать",copied:"Скопировано",openBooking:"Открыть запись",google:"Google Календарь",noBookings:"Нет записей за этот период",appointments:"записей"},
    uk:{calendar:"Календар",day:"День",week:"Тиждень",month:"Місяць",agenda:"Список",today:"Сьогодні",previous:"Назад",next:"Вперед",technician:"Майстер",allTechs:"Усі майстри",unassigned:"Без майстра",bookingLink:"Посилання для запису клієнтів",copyLink:"Копіювати",copied:"Скопійовано",openBooking:"Відкрити запис",google:"Google Календар",noBookings:"Немає записів за цей період",appointments:"записів"},
    es:{calendar:"Calendario",day:"Día",week:"Semana",month:"Mes",agenda:"Agenda",today:"Hoy",previous:"Anterior",next:"Siguiente",technician:"Técnico",allTechs:"Todos los técnicos",unassigned:"Sin asignar",bookingLink:"Enlace de reserva",copyLink:"Copiar",copied:"Copiado",openBooking:"Abrir reserva",google:"Google Calendar",noBookings:"No hay citas en este periodo",appointments:"citas"},
    it:{calendar:"Calendario",day:"Giorno",week:"Settimana",month:"Mese",agenda:"Agenda",today:"Oggi",previous:"Precedente",next:"Successivo",technician:"Tecnico",allTechs:"Tutti i tecnici",unassigned:"Non assegnato",bookingLink:"Link prenotazioni clienti",copyLink:"Copia",copied:"Copiato",openBooking:"Apri prenotazione",google:"Google Calendar",noBookings:"Nessun appuntamento nel periodo",appointments:"appuntamenti"},
    fr:{calendar:"Calendrier",day:"Jour",week:"Semaine",month:"Mois",agenda:"Agenda",today:"Aujourd’hui",previous:"Précédent",next:"Suivant",technician:"Technicien",allTechs:"Tous les techniciens",unassigned:"Non attribué",bookingLink:"Lien de réservation client",copyLink:"Copier",copied:"Copié",openBooking:"Ouvrir réservation",google:"Google Agenda",noBookings:"Aucun rendez-vous sur cette période",appointments:"rendez-vous"},
  }[locale];

  let bookings = [];
  let shop = null;
  let mode = localStorage.getItem("hc-appointments-view") || "week";
  if (!new Set(["day","week","month","agenda"]).has(mode)) mode = "week";
  let focus = new Date();
  focus.setHours(12,0,0,0);

  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  const parseDate = (value) => { const d=new Date(`${value}T12:00:00`); return Number.isNaN(d.getTime())?new Date():d; };
  const startOfWeek = (date) => { const d=new Date(date); const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(12,0,0,0); return d; };
  const addDays = (date,n) => { const d=new Date(date); d.setDate(d.getDate()+n); return d; };
  const fmtDay = (date, opts={}) => new Intl.DateTimeFormat(lang,{timeZone:"UTC",...opts}).format(new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),12)));
  const fmtTime = (value) => { const [h,m]=String(value||"00:00").split(":").map(Number); return new Intl.DateTimeFormat(lang,{hour:"numeric",minute:"2-digit",timeZone:"UTC"}).format(new Date(Date.UTC(2026,0,1,h||0,m||0))); };

  function googleUrl(booking) {
    const compact=(date,time)=>`${date.replaceAll("-","")}T${String(time||"00:00").replace(":","")}00`;
    const tz=shop?.timezone||"America/Chicago";
    const locationText=[shop?.address_line1,shop?.city,shop?.state,shop?.postal_code].filter(Boolean).join(", ");
    const details=[booking.client_name,booking.client_phone,booking.client_email,booking.technician?.name?`${copy.technician}: ${booking.technician.name}`:""].filter(Boolean).join(" · ");
    const q=new URLSearchParams({action:"TEMPLATE",text:`${booking.service_name} — ${shop?.name||"Hermes Connect"}`,dates:`${compact(booking.appointment_date,booking.start_time)}/${compact(booking.appointment_date,booking.end_time)}`,ctz:tz,details,location:locationText});
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
  }

  const currentFilters = () => {
    const q=(document.getElementById("appointment-search")?.value||"").trim().toLowerCase();
    const status=document.getElementById("appointment-status")?.value||"all";
    const tech=document.getElementById("appointment-technician")?.value||"all";
    return {q,status,tech};
  };
  const filtered = () => {
    const {q,status,tech}=currentFilters();
    return bookings.filter((b) => {
      if(status!=="all" && b.status!==status && !(status==="cancelled"&&b.status==="canceled")) return false;
      const t=b.technician?.name||copy.unassigned;
      if(tech!=="all"&&t!==tech) return false;
      if(!q) return true;
      const vehicle=b.vehicle?`${b.vehicle.year||""} ${b.vehicle.make||""} ${b.vehicle.model||""} ${b.vehicle.vin||""}`:"";
      return `${b.service_name} ${b.client_name} ${b.client_email} ${b.client_phone} ${vehicle} ${t}`.toLowerCase().includes(q);
    });
  };

  function eventCard(b, compact=false) {
    return `<article class="hc-cal-event status-${esc(b.status)}" data-id="${esc(b.id)}">
      <div class="hc-cal-event-time">${esc(fmtTime(b.start_time))}–${esc(fmtTime(b.end_time))}</div>
      <strong>${esc(b.service_name)}</strong>
      <span>${esc(b.client_name||b.client_email||"")}</span>
      ${compact?"":`<span>${esc(b.technician?.name||copy.unassigned)}</span>`}
      <a href="${esc(googleUrl(b))}" target="_blank" rel="noopener">${esc(copy.google)}</a>
    </article>`;
  }

  function dayView(items) {
    const date=iso(focus); const onDay=items.filter(b=>b.appointment_date===date).sort((a,b)=>a.start_time.localeCompare(b.start_time));
    const names=[...new Set(onDay.map(b=>b.technician?.name||copy.unassigned))].sort();
    if(!names.length) return empty();
    return `<div class="hc-cal-lanes">${names.map(name=>`<section class="hc-cal-lane"><header><strong>${esc(name)}</strong><span>${onDay.filter(b=>(b.technician?.name||copy.unassigned)===name).length}</span></header>${onDay.filter(b=>(b.technician?.name||copy.unassigned)===name).map(b=>eventCard(b)).join("")}</section>`).join("")}</div>`;
  }
  function weekView(items) {
    const start=startOfWeek(focus);
    return `<div class="hc-cal-week">${Array.from({length:7},(_,i)=>{const d=addDays(start,i), key=iso(d), dayItems=items.filter(b=>b.appointment_date===key).sort((a,b)=>a.start_time.localeCompare(b.start_time));return `<section class="hc-cal-day ${key===iso(new Date())?"is-today":""}"><header><span>${esc(fmtDay(d,{weekday:"short"}))}</span><strong>${esc(fmtDay(d,{month:"short",day:"numeric"}))}</strong><em>${dayItems.length}</em></header><div>${dayItems.length?dayItems.map(b=>eventCard(b,true)).join(""):"<p class=\"hc-cal-day-empty\">—</p>"}</div></section>`}).join("")}</div>`;
  }
  function monthView(items) {
    const first=new Date(focus.getFullYear(),focus.getMonth(),1,12), grid=startOfWeek(first);
    return `<div class="hc-cal-month">${Array.from({length:42},(_,i)=>{const d=addDays(grid,i),key=iso(d),dayItems=items.filter(b=>b.appointment_date===key).sort((a,b)=>a.start_time.localeCompare(b.start_time)),outside=d.getMonth()!==focus.getMonth();return `<section class="hc-cal-month-day ${outside?"is-outside":""} ${key===iso(new Date())?"is-today":""}" data-date="${key}"><header><strong>${d.getDate()}</strong><span>${dayItems.length||""}</span></header>${dayItems.slice(0,3).map(b=>`<button type="button" class="hc-cal-mini" data-jump-date="${key}" title="${esc(b.service_name)}"><span>${esc(fmtTime(b.start_time))}</span>${esc(b.service_name)}</button>`).join("")}${dayItems.length>3?`<button type="button" class="hc-cal-more" data-jump-date="${key}">+${dayItems.length-3}</button>`:""}</section>`}).join("")}</div>`;
  }
  const empty=()=>`<div class="hc-cal-empty">${esc(copy.noBookings)}</div>`;

  function titleText() {
    if(mode==="day") return fmtDay(focus,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    if(mode==="week"){const s=startOfWeek(focus),e=addDays(s,6);return `${fmtDay(s,{month:"short",day:"numeric"})} – ${fmtDay(e,{month:"short",day:"numeric",year:"numeric"})}`;}
    if(mode==="month") return fmtDay(focus,{month:"long",year:"numeric"});
    return copy.agenda;
  }

  function render() {
    const wrap=document.querySelector("[data-hc-calendar]"); if(!wrap) return;
    const items=filtered();
    wrap.querySelector("[data-cal-title]").textContent=titleText();
    wrap.querySelector("[data-cal-count]").textContent=`${items.length} ${copy.appointments}`;
    wrap.querySelectorAll("[data-view]").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.view===mode));
    const canvas=wrap.querySelector("[data-cal-canvas]");
    if(mode==="day") canvas.innerHTML=dayView(items);
    else if(mode==="week") canvas.innerHTML=weekView(items);
    else if(mode==="month") canvas.innerHTML=monthView(items);
    else canvas.innerHTML="";
    canvas.classList.toggle("hidden",mode==="agenda");
    const list=document.getElementById("appointments-list"),emptyNode=document.getElementById("appointments-empty");
    if(mode!=="agenda"){list?.classList.add("hidden");emptyNode?.classList.add("hidden");}
    else window.dispatchEvent(new Event("hc:appointments-agenda-request"));
    canvas.querySelectorAll("[data-jump-date]").forEach(btn=>btn.addEventListener("click",()=>{focus=parseDate(btn.dataset.jumpDate);mode="day";localStorage.setItem("hc-appointments-view",mode);render();}));
  }

  function shift(delta) {
    if(mode==="day") focus=addDays(focus,delta);
    else if(mode==="week") focus=addDays(focus,delta*7);
    else if(mode==="month") focus=new Date(focus.getFullYear(),focus.getMonth()+delta,1,12);
    render();
  }

  async function init() {
    const toolbar=document.querySelector(".appointments-toolbar"); if(!toolbar||document.querySelector("[data-hc-calendar]")) return;
    const techLabel=document.createElement("label");techLabel.className="filter-field";techLabel.innerHTML=`<span>${esc(copy.technician)}</span><select id="appointment-technician"><option value="all">${esc(copy.allTechs)}</option></select>`;toolbar.append(techLabel);
    const calendar=document.createElement("section");calendar.className="hc-appointments-calendar";calendar.dataset.hcCalendar="true";calendar.innerHTML=`<div class="hc-cal-top"><div><p class="eyebrow">${esc(copy.calendar)}</p><h2 data-cal-title></h2><span data-cal-count></span></div><div class="hc-cal-actions"><div class="hc-view-switch">${["day","week","month","agenda"].map(v=>`<button type="button" data-view="${v}">${esc(copy[v])}</button>`).join("")}</div><div class="hc-date-nav"><button type="button" data-prev aria-label="${esc(copy.previous)}">←</button><button type="button" data-today>${esc(copy.today)}</button><button type="button" data-next aria-label="${esc(copy.next)}">→</button></div></div></div><div class="hc-booking-share" data-booking-share hidden><div><small>${esc(copy.bookingLink)}</small><strong data-booking-url></strong></div><button type="button" data-copy-booking>${esc(copy.copyLink)}</button><a data-open-booking target="_blank" rel="noopener">${esc(copy.openBooking)}</a></div><div class="hc-cal-canvas" data-cal-canvas></div>`;
    toolbar.insertAdjacentElement("beforebegin",calendar);
    calendar.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.view;localStorage.setItem("hc-appointments-view",mode);render();}));
    calendar.querySelector("[data-prev]").addEventListener("click",()=>shift(-1));
    calendar.querySelector("[data-next]").addEventListener("click",()=>shift(1));
    calendar.querySelector("[data-today]").addEventListener("click",()=>{focus=new Date();focus.setHours(12,0,0,0);render();});
    document.getElementById("appointment-search")?.addEventListener("input",render);
    document.getElementById("appointment-status")?.addEventListener("change",render);
    techLabel.querySelector("select")?.addEventListener("change",render);
    try { const r=await fetch("/api/repair-shop/profile",{credentials:"same-origin"}); const d=await r.json(); if(r.ok&&d.success&&d.shop){shop=d.shop; const url=`${location.origin}${ROOT}/booking/?shop=${encodeURIComponent(shop.slug)}${locale==="en"?"":`&lang=${locale}`}`; const share=calendar.querySelector("[data-booking-share]");share.hidden=false;share.querySelector("[data-booking-url]").textContent=url;share.querySelector("[data-open-booking]").href=url;share.querySelector("[data-copy-booking]").addEventListener("click",async(e)=>{await navigator.clipboard.writeText(url);const b=e.currentTarget,old=b.textContent;b.textContent=copy.copied;setTimeout(()=>b.textContent=old,1400);});}} catch {}
    render();
  }

  window.addEventListener("hc:appointments-loaded",(event)=>{
    bookings=Array.isArray(event.detail?.bookings)?event.detail.bookings:[];
    const select=document.getElementById("appointment-technician");
    if(select){const current=select.value;const names=[...new Set(bookings.map(b=>b.technician?.name).filter(Boolean))].sort();select.innerHTML=`<option value="all">${esc(copy.allTechs)}</option>${names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("")}`;if(names.includes(current))select.value=current;}
    render();
  });
  window.addEventListener("hc:appointments-agenda-request",()=>document.getElementById("appointment-search")?.dispatchEvent(new Event("input")));
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
