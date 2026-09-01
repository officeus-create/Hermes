import { expect, test } from "@playwright/test";

// The reminder helper is runtime JavaScript shared by Pages Functions and these contract tests.
const engagement = await import("../functions/api/_lib/account-engagement.mjs");

test("weekly inactivity reminder becomes due shortly after the registration time after seven inactive days", async () => {
  const createdAt = "2026-08-24T15:37:00.000Z"; // 10:37 America/Chicago
  const now = new Date("2026-08-31T15:40:00.000Z"); // 10:40 America/Chicago

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, now)).toBe(true);
});

test("scheduled checks can deliver shortly after a registration time that crosses into the next clock hour", async () => {
  const createdAt = "2026-08-24T15:55:00.000Z"; // 10:55 America/Chicago

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, new Date("2026-08-31T16:07:00.000Z"))).toBe(true); // 11:07, 12 minutes after the original local time

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, new Date("2026-08-31T15:52:00.000Z"))).toBe(false); // never send before the registration time
});

test("registration-time reminder window remains valid when the scheduler crosses local midnight", async () => {
  const createdAt = "2026-08-23T04:55:00.000Z"; // Saturday 23:55 America/Chicago
  const now = new Date("2026-08-30T05:07:00.000Z"); // Sunday 00:07 America/Chicago, 12 minutes later in the weekly window

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, now)).toBe(true);
});

test("weekly inactivity reminder does not fire when the owner returned recently or outside the registration-time window", async () => {
  const createdAt = "2026-08-24T15:37:00.000Z";

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: "2026-08-29T15:37:00.000Z",
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, new Date("2026-08-31T15:40:00.000Z"))).toBe(false);

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, new Date("2026-08-31T16:00:00.000Z"))).toBe(false);
});

test("weekly inactivity reminder respects the reminder cooldown and opt-out", async () => {
  const createdAt = "2026-08-17T15:37:00.000Z";
  const now = new Date("2026-08-31T15:40:00.000Z");

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: "2026-08-29T15:40:00.000Z",
    timeZone: "America/Chicago",
    emailEnabled: true,
  }, now)).toBe(false);

  expect(engagement.isWeeklyInactivityReminderDue({
    createdAt,
    lastActiveAt: createdAt,
    lastReminderAt: null,
    timeZone: "America/Chicago",
    emailEnabled: false,
  }, now)).toBe(false);
});

test("unsubscribe links are signed and reminder copy contains direct dashboard and opt-out paths", async () => {
  const specialistId = "specialist-test-owner";
  const secret = "test-only-reminder-secret";
  const signature = await engagement.signReminderUnsubscribe(specialistId, secret);

  expect(await engagement.verifyReminderUnsubscribe(specialistId, signature, secret)).toBe(true);
  expect(await engagement.verifyReminderUnsubscribe("specialist-other", signature, secret)).toBe(false);

  const dashboardUrl = engagement.canonicalRepairShopDashboardUrl("ru");
  const unsubscribeUrl = await engagement.canonicalReminderUnsubscribeUrl(specialistId, secret, "ru");
  const text = engagement.weeklyInactivityEmailText({
    name: "Владелец",
    dashboardUrl,
    unsubscribeUrl,
    locale: "ru",
  });

  expect(dashboardUrl).toContain("/repair-shops/dashboard/?lang=ru");
  expect(unsubscribeUrl).toContain("/api/hermes-connect/reminders/unsubscribe");
  expect(unsubscribeUrl).toContain("sig=");
  expect(text).toContain("Прошла примерно неделя");
  expect(text).toContain(dashboardUrl);
  expect(text).toContain(unsubscribeUrl);
  expect(text).not.toContain("password");
});
