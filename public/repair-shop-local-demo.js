/* Repair Shop launch bootstrap.
 * Keeps the canonical EN/RU/UK/ES/IT/FR locale on owner links and closes auth UI leaks.
 * Local demo mode remains available on localhost with ?demo=1.
 * A production-safe preview is allowed only with the explicit ?demo=1&preview=1 pair.
 * All intercepted mutations stay in memory and never reach the real API or D1.
 */
(() => {
  const ROOT = "/services/hermes-connect/repair-shops";
  const params = new URLSearchParams(window.location.search);
  const supported = new Set(["en", "ru", "uk", "es", "it", "fr"]);
  const requested = (params.get("lang") || document.documentElement.lang || "en").toLowerCase();
  const locale = supported.has(requested) ? requested : "en";
  const local = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const demo = params.get("demo") === "1";
  const preview = params.get("preview") === "1";
  const repairRoute = window.location.pathname.startsWith(`${ROOT}/`);
  const publicPreview = !local && demo && preview && repairRoute;

  const ensureDesignPolish = () => {
    if (document.querySelector('link[data-repair-shop-design-polish]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/repair-shop-design-polish.css";
    link.dataset.repairShopDesignPolish = "true";
    document.head.append(link);
  };
  ensureDesignPolish();

  const authCopy = {
    en: {
      documentTitle:"Owner Authentication | Hermes Connect", back:"Back to Partner Portal", verifying:"Verifying secure session…", sessionTitle:"Session Active", sessionCopy:"You are securely connected to the Hermes network.", name:"Name:", email:"Email:", role:"Role:", dashboard:"Go to Shop Dashboard", logout:"Secure Logout", title:"Repair Shop Owner Access", subtitle:"Sign in or register to manage your shop profile, services, availability, bookings, customers, and feedback.", login:"Login", register:"Register New Shop", loginEmail:"Email Address", loginEmailHelp:"Use the email attached to your Hermes owner account.", password:"Password", loginSubmit:"Secure Login", fullName:"Your Full Name", businessEmail:"Business Email", newPassword:"Password", confirmPassword:"Confirm Password", newPasswordPlaceholder:"Min. 8 characters", confirmPlaceholder:"Re-enter your password", passwordHelp:"Use at least 8 characters and enter the same password twice.", create:"Create Shop Account", forgot:"Forgot password?", signingIn:"Signing in…", creating:"Creating account…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Passwords do not match. Re-enter them and try again.","An account with this email already exists. Try signing in instead.":"An account with this email already exists. Try signing in instead.","We could not sign you in. Check your details and try again.":"We could not sign you in. Check your details and try again.","We could not reach Hermes. Check your connection and try again.":"We could not reach Hermes. Check your connection and try again.","We could not create your account. Check your details and try again.":"We could not create your account. Check your details and try again.","Logout failed.":"Logout failed."}
    },
    ru: {
      documentTitle:"Доступ владельца СТО | Hermes Connect", back:"Назад к СТО", verifying:"Проверяем защищённую сессию…", sessionTitle:"Сессия активна", sessionCopy:"Вы безопасно подключены к Hermes.", name:"Имя:", email:"Email:", role:"Роль:", dashboard:"Перейти в кабинет СТО", logout:"Выйти", title:"Доступ владельца СТО", subtitle:"Войдите или зарегистрируйтесь, чтобы управлять профилем СТО, услугами, графиком, записями, клиентами и отзывами.", login:"Войти", register:"Зарегистрировать СТО", loginEmail:"Email", loginEmailHelp:"Используйте email, привязанный к вашему аккаунту владельца Hermes.", password:"Пароль", loginSubmit:"Войти", fullName:"Ваше имя", businessEmail:"Рабочий email", newPassword:"Пароль", confirmPassword:"Повторите пароль", newPasswordPlaceholder:"Минимум 8 символов", confirmPlaceholder:"Введите пароль ещё раз", passwordHelp:"Используйте минимум 8 символов и дважды введите одинаковый пароль.", create:"Создать аккаунт СТО", forgot:"Забыли пароль?", signingIn:"Входим…", creating:"Создаём аккаунт…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Пароли не совпадают. Введите их ещё раз.","An account with this email already exists. Try signing in instead.":"Аккаунт с этим email уже существует. Попробуйте войти.","We could not sign you in. Check your details and try again.":"Не удалось войти. Проверьте данные и попробуйте ещё раз.","We could not reach Hermes. Check your connection and try again.":"Не удалось связаться с Hermes. Проверьте интернет-соединение и попробуйте ещё раз.","We could not create your account. Check your details and try again.":"Не удалось создать аккаунт. Проверьте данные и попробуйте ещё раз.","Logout failed.":"Не удалось выйти из аккаунта."}
    },
    uk: {
      documentTitle:"Доступ власника СТО | Hermes Connect", back:"Назад до СТО", verifying:"Перевіряємо захищену сесію…", sessionTitle:"Сесія активна", sessionCopy:"Ви безпечно підключені до Hermes.", name:"Ім’я:", email:"Email:", role:"Роль:", dashboard:"Перейти до кабінету СТО", logout:"Вийти", title:"Доступ власника СТО", subtitle:"Увійдіть або зареєструйтеся, щоб керувати профілем СТО, послугами, графіком, записами, клієнтами та відгуками.", login:"Увійти", register:"Зареєструвати СТО", loginEmail:"Email", loginEmailHelp:"Використовуйте email, прив’язаний до вашого акаунта власника Hermes.", password:"Пароль", loginSubmit:"Увійти", fullName:"Ваше ім’я", businessEmail:"Робочий email", newPassword:"Пароль", confirmPassword:"Повторіть пароль", newPasswordPlaceholder:"Щонайменше 8 символів", confirmPlaceholder:"Введіть пароль ще раз", passwordHelp:"Використовуйте щонайменше 8 символів і двічі введіть однаковий пароль.", create:"Створити акаунт СТО", forgot:"Забули пароль?", signingIn:"Входимо…", creating:"Створюємо акаунт…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Паролі не збігаються. Введіть їх ще раз.","An account with this email already exists. Try signing in instead.":"Акаунт із цим email уже існує. Спробуйте увійти.","We could not sign you in. Check your details and try again.":"Не вдалося увійти. Перевірте дані та спробуйте ще раз.","We could not reach Hermes. Check your connection and try again.":"Не вдалося зв’язатися з Hermes. Перевірте інтернет-з’єднання та спробуйте ще раз.","We could not create your account. Check your details and try again.":"Не вдалося створити акаунт. Перевірте дані та спробуйте ще раз.","Logout failed.":"Не вдалося вийти з акаунта."}
    },
    es: {
      documentTitle:"Acceso del propietario del taller | Hermes Connect", back:"Volver al taller", verifying:"Verificando la sesión segura…", sessionTitle:"Sesión activa", sessionCopy:"Estás conectado de forma segura a Hermes.", name:"Nombre:", email:"Email:", role:"Rol:", dashboard:"Ir al panel del taller", logout:"Cerrar sesión", title:"Acceso del propietario del taller", subtitle:"Inicia sesión o regístrate para gestionar el perfil, los servicios, la disponibilidad, las reservas, los clientes y los comentarios del taller.", login:"Iniciar sesión", register:"Registrar taller", loginEmail:"Email", loginEmailHelp:"Usa el email vinculado a tu cuenta de propietario de Hermes.", password:"Contraseña", loginSubmit:"Iniciar sesión", fullName:"Nombre completo", businessEmail:"Email del negocio", newPassword:"Contraseña", confirmPassword:"Confirmar contraseña", newPasswordPlaceholder:"Mínimo 8 caracteres", confirmPlaceholder:"Vuelve a escribir la contraseña", passwordHelp:"Usa al menos 8 caracteres e introduce la misma contraseña dos veces.", create:"Crear cuenta del taller", forgot:"¿Olvidaste tu contraseña?", signingIn:"Iniciando sesión…", creating:"Creando cuenta…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Las contraseñas no coinciden. Vuelve a introducirlas.","An account with this email already exists. Try signing in instead.":"Ya existe una cuenta con este email. Prueba a iniciar sesión.","We could not sign you in. Check your details and try again.":"No pudimos iniciar tu sesión. Revisa los datos e inténtalo de nuevo.","We could not reach Hermes. Check your connection and try again.":"No pudimos conectar con Hermes. Revisa tu conexión e inténtalo de nuevo.","We could not create your account. Check your details and try again.":"No pudimos crear tu cuenta. Revisa los datos e inténtalo de nuevo.","Logout failed.":"No se pudo cerrar la sesión."}
    },
    it: {
      documentTitle:"Accesso proprietario officina | Hermes Connect", back:"Torna all’officina", verifying:"Verifica della sessione sicura…", sessionTitle:"Sessione attiva", sessionCopy:"Sei connesso in modo sicuro a Hermes.", name:"Nome:", email:"Email:", role:"Ruolo:", dashboard:"Vai al pannello officina", logout:"Esci", title:"Accesso proprietario officina", subtitle:"Accedi o registrati per gestire profilo, servizi, disponibilità, prenotazioni, clienti e feedback dell’officina.", login:"Accedi", register:"Registra officina", loginEmail:"Email", loginEmailHelp:"Usa l’email collegata al tuo account proprietario Hermes.", password:"Password", loginSubmit:"Accedi", fullName:"Nome completo", businessEmail:"Email aziendale", newPassword:"Password", confirmPassword:"Conferma password", newPasswordPlaceholder:"Minimo 8 caratteri", confirmPlaceholder:"Inserisci di nuovo la password", passwordHelp:"Usa almeno 8 caratteri e inserisci due volte la stessa password.", create:"Crea account officina", forgot:"Password dimenticata?", signingIn:"Accesso in corso…", creating:"Creazione account…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Le password non coincidono. Inseriscile di nuovo.","An account with this email already exists. Try signing in instead.":"Esiste già un account con questa email. Prova ad accedere.","We could not sign you in. Check your details and try again.":"Impossibile accedere. Controlla i dati e riprova.","We could not reach Hermes. Check your connection and try again.":"Impossibile raggiungere Hermes. Controlla la connessione e riprova.","We could not create your account. Check your details and try again.":"Impossibile creare l’account. Controlla i dati e riprova.","Logout failed.":"Impossibile uscire dall’account."}
    },
    fr: {
      documentTitle:"Accès propriétaire d’atelier | Hermes Connect", back:"Retour à l’atelier", verifying:"Vérification de la session sécurisée…", sessionTitle:"Session active", sessionCopy:"Vous êtes connecté à Hermes de manière sécurisée.", name:"Nom :", email:"Email :", role:"Rôle :", dashboard:"Accéder au tableau de bord", logout:"Se déconnecter", title:"Accès propriétaire d’atelier", subtitle:"Connectez-vous ou inscrivez-vous pour gérer le profil, les services, les disponibilités, les réservations, les clients et les avis de l’atelier.", login:"Connexion", register:"Inscrire un atelier", loginEmail:"Email", loginEmailHelp:"Utilisez l’email associé à votre compte propriétaire Hermes.", password:"Mot de passe", loginSubmit:"Se connecter", fullName:"Nom complet", businessEmail:"Email professionnel", newPassword:"Mot de passe", confirmPassword:"Confirmer le mot de passe", newPasswordPlaceholder:"8 caractères minimum", confirmPlaceholder:"Saisissez de nouveau le mot de passe", passwordHelp:"Utilisez au moins 8 caractères et saisissez deux fois le même mot de passe.", create:"Créer le compte de l’atelier", forgot:"Mot de passe oublié ?", signingIn:"Connexion…", creating:"Création du compte…",
      errors:{"Passwords do not match. Re-enter them and try again.":"Les mots de passe ne correspondent pas. Saisissez-les de nouveau.","An account with this email already exists. Try signing in instead.":"Un compte existe déjà avec cet email. Essayez de vous connecter.","We could not sign you in. Check your details and try again.":"Connexion impossible. Vérifiez vos informations et réessayez.","We could not reach Hermes. Check your connection and try again.":"Impossible de joindre Hermes. Vérifiez votre connexion et réessayez.","We could not create your account. Check your details and try again.":"Impossible de créer le compte. Vérifiez vos informations et réessayez.","Logout failed.":"Impossible de se déconnecter."}
    }
  };
  const previewCopy = {
    en:{live:"LIVE PREVIEW · synthetic data",local:"LOCAL DEMO · synthetic data"},
    ru:{live:"ПРЕДПРОСМОТР · синтетические данные",local:"ЛОКАЛЬНОЕ ДЕМО · синтетические данные"},
    uk:{live:"ПЕРЕДПЕРЕГЛЯД · синтетичні дані",local:"ЛОКАЛЬНЕ ДЕМО · синтетичні дані"},
    es:{live:"VISTA PREVIA · datos sintéticos",local:"DEMO LOCAL · datos sintéticos"},
    it:{live:"ANTEPRIMA · dati sintetici",local:"DEMO LOCALE · dati sintetici"},
    fr:{live:"APERÇU · données synthétiques",local:"DÉMO LOCALE · données synthétiques"}
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && node.textContent !== value) node.textContent = value;
  };
  const setOwnText = (selector, value) => {
    const node = document.querySelector(selector);
    if (!node) return;
    const textNode = Array.from(node.childNodes).find((child) => child.nodeType === Node.TEXT_NODE && child.nodeValue?.trim());
    if (textNode) textNode.nodeValue = ` ${value}`;
    else if (node.textContent !== value) node.append(document.createTextNode(` ${value}`));
  };
  const setPlaceholder = (selector, value) => {
    const node = document.querySelector(selector);
    if (node instanceof HTMLInputElement && node.placeholder !== value) node.placeholder = value;
  };
  const localeHref = (href) => {
    const url = new URL(href, window.location.origin);
    if (locale === "en") url.searchParams.delete("lang"); else url.searchParams.set("lang", locale);
    if (demo) url.searchParams.set("demo", "1");
    if (preview) url.searchParams.set("preview", "1");
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const localizeLinks = () => {
    document.querySelectorAll(`a[href^="${ROOT}"]`).forEach((node) => {
      if (!(node instanceof HTMLAnchorElement)) return;
      const next = localeHref(node.getAttribute("href") || ROOT);
      if (node.getAttribute("href") !== next) node.setAttribute("href", next);
    });
  };
  const localizeAuth = () => {
    const path = window.location.pathname.replace(/\/+$/, "");
    if (path !== `${ROOT}/auth`) return;
    const t = authCopy[locale] || authCopy.en;
    document.documentElement.lang = locale;
    document.title = t.documentTitle;
    setOwnText(".back-link", t.back);
    setText("#auth-loading p", t.verifying);
    setText("#auth-authenticated .auth-header h2", t.sessionTitle);
    setText("#auth-authenticated .auth-header .auth-subtitle", t.sessionCopy);
    setText("#auth-authenticated .user-details .detail-row:nth-child(1) span", t.name);
    setText("#auth-authenticated .user-details .detail-row:nth-child(2) span", t.email);
    setText("#auth-authenticated .user-details .detail-row:nth-child(3) span", t.role);
    setText("#auth-authenticated .auth-actions a", t.dashboard);
    setOwnText("#logout-btn", t.logout);
    setText("#auth-forms .auth-header h1", t.title);
    setText("#auth-forms .auth-header .auth-subtitle", t.subtitle);
    setText('[data-tab="login"]', t.login);
    setText('[data-tab="register"]', t.register);
    setText('label[for="login-email"]', t.loginEmail);
    setText("#login-email-help", t.loginEmailHelp);
    setText('label[for="login-password"]', t.password);
    setText('#login-form button[type="submit"]', t.loginSubmit);
    setText('label[for="reg-name"]', t.fullName);
    setText('label[for="reg-email"]', t.businessEmail);
    setText('label[for="reg-password"]', t.newPassword);
    setText('label[for="reg-password-confirm"]', t.confirmPassword);
    setPlaceholder("#reg-password", t.newPasswordPlaceholder);
    setPlaceholder("#reg-password-confirm", t.confirmPlaceholder);
    setText("#reg-password-help", t.passwordHelp);
    setText('#register-form button[type="submit"]', t.create);
    const forgot = document.querySelector("[data-repair-forgot-password]");
    if (forgot) forgot.textContent = t.forgot;
    const back = document.querySelector(".back-link");
    if (back instanceof HTMLAnchorElement) back.href = localeHref(`${ROOT}/`);
    const dashboard = document.querySelector("#auth-authenticated .auth-actions a");
    if (dashboard instanceof HTMLAnchorElement) dashboard.href = localeHref(`${ROOT}/dashboard/`);
    const alert = document.getElementById("alert-box");
    if (alert?.textContent) {
      const translated = t.errors[alert.textContent.trim()];
      if (translated && alert.textContent !== translated) alert.textContent = translated;
    }
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    if (loginButton?.textContent?.trim() === "Signing in…") loginButton.textContent = t.signingIn;
    const createButton = document.querySelector('#register-form button[type="submit"]');
    if (createButton?.textContent?.trim() === "Creating account…") createButton.textContent = t.creating;
  };
  const localizePreviewBadge = () => {
    const badge = document.querySelector("[data-local-demo-badge]");
    if (!badge) return;
    const t = previewCopy[locale] || previewCopy.en;
    const value = publicPreview ? t.live : t.local;
    if (badge.textContent !== value) badge.textContent = value;
  };
  let scheduled = false;
  const applyLocaleParity = () => {
    scheduled = false;
    localizeLinks();
    localizeAuth();
    localizePreviewBadge();
  };
  const scheduleLocaleParity = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(applyLocaleParity);
  };
  const startLocaleParity = () => {
    applyLocaleParity();
    new MutationObserver(scheduleLocaleParity).observe(document.body, { childList:true, subtree:true, characterData:true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startLocaleParity, { once:true });
  else startLocaleParity();

  if (!demo || (!local && !publicPreview)) return;

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
    const badge = document.createElement("div"); badge.dataset.localDemoBadge = "true"; badge.textContent = publicPreview ? (previewCopy[locale] || previewCopy.en).live : (previewCopy[locale] || previewCopy.en).local; document.body.append(badge);
    const style = document.createElement("style"); style.textContent = "[data-local-demo-badge]{position:fixed;right:18px;bottom:18px;z-index:9999;padding:8px 11px;border-radius:999px;background:rgba(11,13,18,.92);color:#fff;font:800 11px/1 system-ui;letter-spacing:.08em;box-shadow:0 10px 28px rgba(15,23,42,.20),0 0 0 1px rgba(124,92,255,.14);backdrop-filter:blur(14px)}"; document.head.append(style);
  };
  const appendDemoToLinks = () => document.querySelectorAll(`a[href^="${ROOT}/"]`).forEach((node) => { if (!(node instanceof HTMLAnchorElement)) return; const next = localeHref(node.getAttribute("href") || ROOT); if (node.getAttribute("href") !== next) node.setAttribute("href", next); });
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
    if (path === "/api/repair-shop/driver-discount") { if (method === "PUT") driverDiscount = { ...driverDiscount, ...(await readBody(init)) }; return json({ success:true, discount:clone(driverDiscount) });
    if (path === "/api/repair-shop/capabilities") return json({ success:true, capabilities:{ accepts_walk_ins:true, accepts_fleet:true, accepts_heavy_duty:true, after_hours_dropoff:true, waiting_area:true } });
    if (path === "/api/repair-shop/capacity") return json({ success:true, capacity:{ bays:6, technicians:3, daily_booking_limit:12 } });
    if (path === "/api/repair-shop/access") return json({ success:true, access:{ can_manage_shop:true } });
    if (path === "/api/public/repair-shop") return json({ success:true, shop:clone(profile), services:clone(services), driver_discount:{ ...clone(driverDiscount), service_names:services.filter((entry) => driverDiscount.service_ids.includes(entry.id)).map((entry) => entry.name) } });
    return json({ success:true });
  };
})();