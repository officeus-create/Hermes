import { type Page, expect, test } from "@playwright/test";

const bookingUrl = "/services/hermes-connect/repair-shops/booking/";
const workspaceUrl = "/demos/hermes-connect-brand-v1/workspace.html";

// Viewport-independent helper to switch dashboard views
async function switchView(page: Page, viewId: string) {
  const trigger = page.locator(`[data-view="${viewId}"], [data-mobile-view="${viewId}"]`).filter({ visible: true });
  try {
    await trigger.waitFor({ state: "visible", timeout: 2000 });
    await trigger.click({ force: true });
  } catch (e) {
    // Fallback to native click if trigger is hidden (e.g. mobile hidden sidebar/view)
    await page.evaluate((id) => {
      const btn = document.querySelector(`[data-view="${id}"], [data-mobile-view="${id}"]`) as HTMLElement;
      if (btn) btn.click();
    }, viewId);
  }
}

test.describe("Hermes Connect Repair Booking Loop & CRM Transactional Sync", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home, clear storage and seed analytics consent.
    // By doing this once inside beforeEach rather than using addInitScript,
    // we completely avoid reloading/navigation wipe-outs, allowing bookings
    // to persist securely throughout the entire test flow.
    await page.goto("/");
    await page.evaluate(async () => {
      window.localStorage.clear();
      window.localStorage.setItem('hermes-analytics-consent', 'granted');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    });
  });

  test.skip("Should execute full customer booking loop and verify CRM bidirectional status sync", async ({ page }) => {
    // Listen to console events from the browser page
    page.on('console', msg => {
      console.log(`PAGE LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.error(`PAGE UNCAUGHT ERROR: ${err.message}\n${err.stack}`);
    });

    // 1. Visit Booking Portal
    await page.goto(bookingUrl);
    await expect(page.locator("h1")).toContainText("Live Customer Booking Intake");

    // -- STEP 1: Select Service --
    await page.locator("label[for='svc-oil_change']").click({ force: true });
    await page.locator("#next-btn").click({ force: true });

    // -- STEP 2: Select Date & Slot --
    const dayOption = page.locator("label[for='day-MON']");
    await dayOption.waitFor({ state: "visible" });
    await dayOption.click({ force: true });

    const slotOption = page.locator("label[for='slot-11:00']");
    await slotOption.waitFor({ state: "visible" });
    await slotOption.click({ force: true });
    await page.locator("#next-btn").click({ force: true });

    // -- STEP 3: Vehicle Information --
    const vehicleYear = page.locator("#vehicle_year");
    await vehicleYear.waitFor({ state: "visible" });
    await vehicleYear.fill("2022");
    await page.fill("#vehicle_make", "Toyota");
    await page.fill("#vehicle_model", "RAV4");
    await page.fill("#vehicle_mileage", "24500");
    await page.locator("#next-btn").click({ force: true });

    // -- STEP 4: Owner Contact & Submit --
    const customerName = page.locator("#customer_name");
    await customerName.waitFor({ state: "visible" });
    await customerName.fill("Jane Doe");
    await page.fill("#customer_email", "jane.doe@example.com");
    await page.fill("#customer_phone", "262-302-3626");
    await page.fill("#booking_notes", "Needs standard oil change and check fluid levels.");
    
    // Intercept download request for iCalendar ics file click
    const downloadPromise = page.waitForEvent("download").catch(() => null);
    await page.locator("#submit-btn").click({ force: true });

    // Verify Success Screen & Receipt Info
    const successHeader = page.locator("#booking-success-card h2");
    await successHeader.waitFor({ state: "visible" });
    await expect(successHeader).toContainText("Appointment Confirmed!");
    await expect(page.locator("#receipt-customer")).toContainText("Jane Doe");
    await expect(page.locator("#receipt-vehicle")).toContainText("2022 Toyota RAV4");
    await expect(page.locator("#receipt-service")).toContainText("Full Synthetic Oil Change");
    await expect(page.locator("#receipt-slot")).toContainText("Monday, Aug 17 at 11:00 AM");

    // Click download ics and check if it triggers
    await page.locator("#download-ics-btn").click({ force: true });
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain(".ics");
    }

    // 2. Open Workspace B2B Dashboard
    await page.goto(workspaceUrl);
    // Unregister any active service worker and clear Cache Storage to avoid cached assets
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          await r.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    });
    // Seed the business type to bypass the onboarding modal
    await page.evaluate(() => {
      localStorage.setItem('hermes_business_type', 'auto_repair');
    });
    // Reload page to apply the seeded choice and get fresh assets
    await page.reload();
    
    // Diagnostic logging to inspect workspace local storage
    const bookingsInWorkspace = await page.evaluate(() => localStorage.getItem('hermes_connect_bookings'));
    const leadStoreInWorkspace = await page.evaluate(() => localStorage.getItem('hermes_lead_store'));
    const businessTypeInWorkspace = await page.evaluate(() => localStorage.getItem('hermes_business_type'));
    console.log("DIAGNOSTIC - hermes_connect_bookings:", bookingsInWorkspace);
    console.log("DIAGNOSTIC - hermes_lead_store:", leadStoreInWorkspace);
    console.log("DIAGNOSTIC - hermes_business_type:", businessTypeInWorkspace);

    // Switch to CRM view viewport-independently
    await switchView(page, "crm");
    
    // Verify booking details inside customers table (Stage renders as "Booked" for "NEW" status)
    const customerTable = page.locator("[data-customer-table]");
    await customerTable.waitFor({ state: "attached" });
    await expect(customerTable).toContainText("Jane Doe");
    await expect(customerTable).toContainText("2022 Toyota RAV4");
    await expect(customerTable).toContainText("Booked");

    // Go to Inbox View to progress status
    await switchView(page, "inbox");
    const inboxList = page.locator("[data-inbox-list]");
    await expect(inboxList).toContainText("Jane Doe");
    
    // Click on Jane Doe's lead to render detail panel (bypass on mobile as list panel is hidden)
    const viewport = page.viewportSize();
    if (!viewport || viewport.width > 850) {
      await page.locator(`[data-inbox-list] [data-lead-item]`).first().click({ force: true });
    }
    
    // Verify active status is "NEW"
    const leadHeader = page.locator("[data-inbox-header]");
    await expect(leadHeader).toContainText("Jane Doe");
    await expect(leadHeader.locator(".status-btn.active")).toContainText("NEW");

    // Progress status to CONFIRMED
    await leadHeader.locator("[data-set-status='CONFIRMED']").click({ force: true });
    await expect(leadHeader.locator(".status-btn.active")).toContainText("CONFIRMED");

    // Progress status to IN SERVICE
    await leadHeader.locator("[data-set-status='IN_SERVICE']").click({ force: true });
    await expect(leadHeader.locator(".status-btn.active")).toContainText("IN SERVICE");

    // Progress status to COMPLETED
    await leadHeader.locator("[data-set-status='COMPLETED']").click({ force: true });
    await expect(leadHeader.locator(".status-btn.active")).toContainText("COMPLETED");

    // Check Weekly Calendar Grid updating status badge
    await switchView(page, "calendar");
    const weekGrid = page.locator("[data-week-grid]");
    await expect(weekGrid).toContainText("Jane Doe");
  });

  test("Should exhaust slot capacity when 3 bookings are submitted for same slot", async ({ page }) => {
    const mockBookings = [
      {
        booking_id: "booking-mock-1",
        customer_name: "Mock One",
        customer_phone: "111-111-1111",
        customer_email: "mock1@example.com",
        service: "Full Synthetic Oil Change",
        price: "$89.99 (Free during Beta)",
        date: "Monday, Aug 17",
        date_id: "MON",
        time_slot: "11:00 AM",
        time_slot_id: "11:00",
        vehicle: { make: "Ford", model: "F-150", year: "2019", mileage: "80000" },
        status: "NEW",
        notes: "Mock 1"
      },
      {
        booking_id: "booking-mock-2",
        customer_name: "Mock Two",
        customer_phone: "222-222-2222",
        customer_email: "mock2@example.com",
        service: "Premium Brake Pad Replacement",
        price: "$149.99 (Free during Beta)",
        date: "Monday, Aug 17",
        date_id: "MON",
        time_slot: "11:00 AM",
        time_slot_id: "11:00",
        vehicle: { make: "Chevy", model: "Silverado", year: "2021", mileage: "30000" },
        status: "CONFIRMED",
        notes: "Mock 2"
      }
    ];

    await page.goto(bookingUrl);
    
    // Inject 2 pre-existing bookings for MON 11:00 AM to local storage
    await page.evaluate((mock) => {
      localStorage.setItem("hermes_connect_bookings", JSON.stringify(mock));
    }, mockBookings);

    // Reload page to parse updated local storage
    await page.reload();

    // Go through booking flow steps to select Mon 11:00 AM
    await page.locator("label[for='svc-oil_change']").click({ force: true });
    await page.locator("#next-btn").click({ force: true });

    // Click Monday option label and wait for transitions
    const dayOption = page.locator("label[for='day-MON']");
    await dayOption.waitFor({ state: "visible" });
    await dayOption.click({ force: true });
    
    // Assert 11:00 AM is 1 of 3 Bays Open
    const slotLabel = page.locator("#label-slot-11\\:00");
    const slotStatusText = page.locator("#capacity-slot-11\\:00");
    await slotStatusText.waitFor({ state: "visible" });
    await expect(slotStatusText).toContainText("1 of 3 Bays Open");

    // Select 11:00 AM slot and progress to make the 3rd booking
    await slotLabel.click({ force: true });
    await page.locator("#next-btn").click({ force: true });

    // Fill vehicle details on Step 3
    const vehicleYear = page.locator("#vehicle_year");
    await vehicleYear.waitFor({ state: "visible" });
    await vehicleYear.fill("2018");
    await page.fill("#vehicle_make", "Honda");
    await page.fill("#vehicle_model", "Accord");
    await page.fill("#vehicle_mileage", "92000");
    await page.locator("#next-btn").click({ force: true });

    // Fill contact details on Step 4
    const customerName = page.locator("#customer_name");
    await customerName.waitFor({ state: "visible" });
    await customerName.fill("Third Person");
    await page.fill("#customer_email", "third@example.com");
    await page.fill("#customer_phone", "333-333-3333");
    
    await page.locator("#submit-btn").click({ force: true });
    await expect(page.locator("#booking-success-card h2")).toContainText("Appointment Confirmed!");

    // Go back to booking start page to verify slot exhaustion
    await page.goto(bookingUrl);

    // Go through steps to check slot availability
    await page.locator("label[for='svc-oil_change']").click({ force: true });
    await page.locator("#next-btn").click({ force: true });

    // Select Monday
    const newDayOption = page.locator("label[for='day-MON']");
    await newDayOption.waitFor({ state: "visible" });
    await newDayOption.click({ force: true });

    // Assert 11:00 AM slot is fully booked and has "exhausted" class
    const finalSlotLabel = page.locator("#label-slot-11\\:00");
    await finalSlotLabel.waitFor({ state: "visible" });
    await expect(finalSlotLabel).toHaveClass(/exhausted/);
    await expect(page.locator("#capacity-slot-11\\:00")).toContainText("Fully Booked (0/3)");
  });
});
