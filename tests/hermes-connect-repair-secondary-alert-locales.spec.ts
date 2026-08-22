import { expect, test } from "@playwright/test";

const json = (body: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
const owner = { success: true, specialist: { id: "owner-alerts", name: "Alex Owner", email: "owner@example.com", role: "Shop Owner" } };
const days = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_open: day_of_week >= 1 && day_of_week <= 5,
  start_time: "08:00",
  end_time: "17:00",
}));

const englishAlerts = [
  "Save your shop profile in the owner workspace before setting availability.",
  "Unable to load your secure session.",
  "Unable to load weekly availability.",
  "Every open day must end after it starts.",
  "Enter a valid start and end time for every open day.",
  "The full seven-day schedule is required.",
  "Unable to save weekly availability.",
  "Weekly availability saved to production.",
  "Network error while saving weekly availability.",
  "Logout failed.",
  "Unable to initialize availability settings.",
  "Unable to verify your secure session.",
  "Unable to load customers.",
  "Unable to initialize customer history.",
] as const;

const expected = {
  es: [
    "Guarda primero el perfil del taller en el panel del propietario antes de configurar la disponibilidad.",
    "No se pudo cargar tu sesión segura.",
    "No se pudo cargar la disponibilidad semanal.",
    "Cada día abierto debe terminar después de la hora de inicio.",
    "Introduce una hora de inicio y fin válidas para cada día abierto.",
    "Se requiere el horario completo de siete días.",
    "No se pudo guardar la disponibilidad semanal.",
    "Disponibilidad semanal guardada.",
    "Error de red al guardar la disponibilidad semanal.",
    "No se pudo cerrar la sesión.",
    "No se pudieron abrir los ajustes de disponibilidad.",
    "No se pudo verificar tu sesión segura.",
    "No se pudieron cargar los clientes.",
    "No se pudo abrir el historial de clientes.",
  ],
  it: [
    "Salva prima il profilo dell’officina nell’area proprietario prima di impostare la disponibilità.",
    "Impossibile caricare la sessione protetta.",
    "Impossibile caricare la disponibilità settimanale.",
    "Ogni giorno aperto deve terminare dopo l’orario di inizio.",
    "Inserisci un orario di inizio e fine valido per ogni giorno aperto.",
    "È richiesto l’intero orario di sette giorni.",
    "Impossibile salvare la disponibilità settimanale.",
    "Disponibilità settimanale salvata.",
    "Errore di rete durante il salvataggio della disponibilità settimanale.",
    "Impossibile effettuare il logout.",
    "Impossibile aprire le impostazioni di disponibilità.",
    "Impossibile verificare la sessione protetta.",
    "Impossibile caricare i clienti.",
    "Impossibile aprire lo storico clienti.",
  ],
  fr: [
    "Enregistrez d’abord le profil de l’atelier dans l’espace propriétaire avant de définir les disponibilités.",
    "Impossible de charger votre session sécurisée.",
    "Impossible de charger les disponibilités hebdomadaires.",
    "Pour chaque jour ouvert, l’heure de fin doit être postérieure à l’heure de début.",
    "Indiquez une heure de début et de fin valides pour chaque jour ouvert.",
    "Le planning complet sur sept jours est requis.",
    "Impossible d’enregistrer les disponibilités hebdomadaires.",
    "Disponibilités hebdomadaires enregistrées.",
    "Erreur réseau lors de l’enregistrement des disponibilités hebdomadaires.",
    "Échec de la déconnexion.",
    "Impossible d’ouvrir les paramètres de disponibilité.",
    "Impossible de vérifier votre session sécurisée.",
    "Impossible de charger les clients.",
    "Impossible d’ouvrir l’historique des clients.",
  ],
} as const;

async function mockAvailability(page: import("@playwright/test").Page) {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/auth/me") return route.fulfill(json(owner));
    if (path === "/api/repair-shop/availability") return route.fulfill(json({ success: true, timezone: "America/Chicago", days }));
    return route.fulfill(json({ success: true }));
  });
}

for (const locale of ["es", "it", "fr"] as const) {
  test(`${locale} translates the complete known secondary alert contract`, async ({ page }) => {
    await mockAvailability(page);
    await page.goto(`/services/hermes-connect/repair-shops/availability/?lang=${locale}`, { waitUntil: "domcontentloaded" });
    const alert = page.locator("#availability-alert");

    for (let index = 0; index < englishAlerts.length; index += 1) {
      await alert.evaluate((node, message) => {
        node.textContent = message;
        node.setAttribute("class", "alert error");
      }, englishAlerts[index]);
      await expect(alert).toHaveText(expected[locale][index]);
    }
  });
}

for (const [locale, translation] of [
  ["ru", "Не удалось загрузить защищённую сессию."],
  ["uk", "Не вдалося завантажити захищену сесію."],
] as const) {
  test(`${locale} covers the previously missing secure-session alert`, async ({ page }) => {
    await mockAvailability(page);
    await page.goto(`/services/hermes-connect/repair-shops/availability/?lang=${locale}`, { waitUntil: "domcontentloaded" });
    const alert = page.locator("#availability-alert");
    await alert.evaluate((node, message) => {
      node.textContent = message;
      node.setAttribute("class", "alert error");
    }, "Unable to load your secure session.");
    await expect(alert).toHaveText(translation);
  });
}
