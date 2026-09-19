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

  const makeTextNode = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text ?? "");
    return node;
  };
  const empty = () => makeTextNode("div", "hc-cal-empty", copy.noBookings);

  function eventCard(b, compact=false) {
    const status = String(b.status || "").replace(/[^a-z0-9_-]/gi, "-");
    const article = makeTextNode("article", `hc-cal-event status-${status}`);
    article.dataset.id = String(b.id || "");
    article.append(
      makeTextNode("div", "hc-cal-event-time", `${fmtTime(b.start_time)}–${fmtTime(b.end_time)}`),
      makeTextNode("strong", "", b.service_name),
      makeTextNode("span", "", b.client_name || b.client_email || ""),
    );
    if (!compact) article.append(makeTextNode("span", "", b.technician?.name || copy.unassigned));
    const google = makeTextNode("a", "", copy.google);
    google.href = googleUrl(b);
    google.target = "_blank";
    google.rel = "noopener";
    article.append(google);
    return article;
  }

  function dayView(items) {
    const date=iso(focus); const onDay=items.filter(b=>b.appointment_date===date).sort((a,b)=>a.start_time.localeCompare(b.start_time));
    const names=[...new Set(onDay.map(b=>b.technician?.name||copy.unassigned))].sort();
    if(!names.length) return empty();
    const lanes=makeTextNode("div","hc-cal-lanes");
    names.forEach((name)=>{
      const lane=makeTextNode("section","hc-cal-lane");
      const laneHeader=document.createElement("header");
      const laneItems=onDay.filter(b=>(b.technician?.name||copy.unassigned)===name);
      laneHeader.append(makeTextNode("strong","",name),makeTextNode("span","",laneItems.length));
      lane.append(laneHeader,...laneItems.map((b)=>eventCard(b)));
      lanes.append(lane);
    });
    return lanes;
  }

  function weekView(items) {
    const start=startOfWeek(focus);
    const week=makeTextNode("div","hc-cal-week");
    Array.from({length:7},(_,i)=>{
      const d=addDays(start,i), key=iso(d), dayItems=items.filter(b=>b.appointment_date===key).sort((a,b)=>a.start_time.localeCompare(b.start_time));
      const day=makeTextNode("section",`hc-cal-day${key===iso(new Date())?" is-today":""}`);
      const dayHeader=document.createElement("header");
      dayHeader.append(
        makeTextNode("span","",fmtDay(d,{weekday:"short"})),
        makeTextNode("strong","",fmtDay(d,{month:"short",day:"numeric"})),
        makeTextNode("em","",dayItems.length),
      );
      const body=document.createElement("div");
      if(dayItems.length) body.append(...dayItems.map((b)=>eventCard(b,true)));
      else body.append(makeTextNode("p","hc-cal-day-empty","—"));
      day.append(dayHeader,body);
      week.append(day);
    });
    return week;
  }

  function monthView(items) {
    const first=new Date(focus.getFullYear(),focus.getMonth(),1,12), grid=startOfWeek(first);
    const month=makeTextNode("div","hc-cal-month");
    Array.from({length:42},(_,i)=>{
      const d=addDays(grid,i),key=iso(d),dayItems=items.filter(b=>b.appointment_date===key).sort((a,b)=>a.start_time.localeCompare(b.start_time)),outside=d.getMonth()!==focus.getMonth();
      const classes=["hc-cal-month-day"];
      if(outside) classes.push("is-outside");
      if(key===iso(new Date())) classes.push("is-today");
      const day=makeTextNode("section",classes.join(" "));
      day.dataset.date=key;
      const dayHeader=document.createElement("header");
      dayHeader.append(makeTextNode("strong","",d.getDate()),makeTextNode("span","",dayItems.length||""));
      day.append(dayHeader);
      dayItems.slice(0,3).forEach((b)=>{
        const jump=makeTextNode("button","hc-cal-mini");
        jump.type="button";
        jump.dataset.jumpDate=key;
        jump.title=String(b.service_name||"");
        jump.append(makeTextNode("span","",fmtTime(b.start_time)),document.createTextNode(String(b.service_name||"")));
        day.append(jump);
      });
      if(dayItems.length>3){
        const more=makeTextNode("button","hc-cal-more",`+${dayItems.length-3}`);
        more.type="button";
        more.dataset.jumpDate=key;
        day.append(more);
      }
      month.append(day);
    });
    return month;
  }

  function titleText() {
    if(mode==="day") return fmtDay(focus,{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    if(mode==="week"){const s=startOfWeek(focus),e=addDays(s,6);return `${fmtDay(s,{month:"short",day:"numeric"})} – ${fmtDay(e,{month:"short",day:"numeric",year:"numeric"})}`;}
    if(mode==="month") return fmtDay(focus,{month:"long",year:"numeric"});
    return copy.agenda;
  }

  function render() {
    const wrap=document.querySelector("[data-hc-calendar]"); if(!wrap) return;
    const {q}=currentFilters();
    const agendaLike=mode==="agenda"||Boolean(q);
    const items=filtered();
    wrap.querySelector("[data-cal-title]").textContent=q?copy.agenda:titleText();
    wrap.querySelector("[data-cal-count]").textContent=`${items.length} ${copy.appointments}`;
    wrap.querySelectorAll("[data-view]").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.view===(agendaLike?"agenda":mode)));
    const canvas=wrap.querySelector("[data-cal-canvas]");
    if(!agendaLike&&mode==="day") canvas.replaceChildren(dayView(items));
    else if(!agendaLike&&mode==="week") canvas.replaceChildren(weekView(items));
    else if(!agendaLike&&mode==="month") canvas.replaceChildren(monthView(items));
    else canvas.replaceChildren();
    canvas.classList.toggle("hidden",agendaLike);
    const list=document.getElementById("appointments-list"),emptyNode=document.getElementById("appointments-empty");
    if(!agendaLike){list?.classList.add("hidden");emptyNode?.classList.add("hidden");}
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
    const techLabel=makeTextNode("label","filter-field");
    const techCaption=makeTextNode("span","",copy.technician);
    const techSelect=document.createElement("select");techSelect.id="appointment-technician";
    const allTechs=document.createElement("option");allTechs.value="all";allTechs.textContent=copy.allTechs;techSelect.append(allTechs);
    techLabel.append(techCaption,techSelect);toolbar.append(techLabel);

    const calendar=makeTextNode("section","hc-appointments-calendar");calendar.dataset.hcCalendar="true";
    const top=makeTextNode("div","hc-cal-top");
    const summary=document.createElement("div");
    const eyebrow=makeTextNode("p","eyebrow",copy.calendar);
    const title=document.createElement("h2");title.dataset.calTitle="";
    const count=document.createElement("span");count.dataset.calCount="";
    summary.append(eyebrow,title,count);
    const actions=makeTextNode("div","hc-cal-actions");
    const viewSwitch=makeTextNode("div","hc-view-switch");
    ["day","week","month","agenda"].forEach((view)=>{
      const button=makeTextNode("button","",copy[view]);button.type="button";button.dataset.view=view;viewSwitch.append(button);
    });
    const dateNav=makeTextNode("div","hc-date-nav");
    const previous=makeTextNode("button","","←");previous.type="button";previous.dataset.prev="";previous.setAttribute("aria-label",copy.previous);
    const today=makeTextNode("button","",copy.today);today.type="button";today.dataset.today="";
    const next=makeTextNode("button","","→");next.type="button";next.dataset.next="";next.setAttribute("aria-label",copy.next);
    dateNav.append(previous,today,next);actions.append(viewSwitch,dateNav);top.append(summary,actions);

    const share=makeTextNode("div","hc-booking-share");share.dataset.bookingShare="";share.hidden=true;
    const shareText=document.createElement("div");
    const shareLabel=makeTextNode("small","",copy.bookingLink);
    const bookingUrl=document.createElement("strong");bookingUrl.dataset.bookingUrl="";
    shareText.append(shareLabel,bookingUrl);
    const copyButton=makeTextNode("button","",copy.copyLink);copyButton.type="button";copyButton.dataset.copyBooking="";
    const openBooking=makeTextNode("a","",copy.openBooking);openBooking.dataset.openBooking="";openBooking.target="_blank";openBooking.rel="noopener";
    share.append(shareText,copyButton,openBooking);
    const canvas=makeTextNode("div","hc-cal-canvas");canvas.dataset.calCanvas="";
    calendar.append(top,share,canvas);
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
    if(select){const current=select.value;const names=[...new Set(bookings.map(b=>b.technician?.name).filter(Boolean))].sort();const options=[];const all=document.createElement("option");all.value="all";all.textContent=copy.allTechs;options.push(all);names.forEach((name)=>{const option=document.createElement("option");option.value=name;option.textContent=name;options.push(option);});select.replaceChildren(...options);if(names.includes(current))select.value=current;}
    render();
  });
  window.addEventListener("hc:appointments-agenda-request",()=>document.getElementById("appointment-search")?.dispatchEvent(new Event("input")));
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
