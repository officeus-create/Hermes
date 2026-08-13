import test from "node:test";
import assert from "node:assert/strict";
import {
  createProfilePreview,
  createTestBookingForProfile,
  defaultDraft,
  validateProfileDraft,
} from "../src/profile-workspace.mjs";

test("creates a safe specialist preview with services and availability", () => {
  const profile = createProfilePreview(defaultDraft);
  assert.equal(profile.status, "profile_preview_ready");
  assert.equal(profile.services.length, 2);
  assert.equal(profile.availability.length, 2);
  assert.equal(profile.databaseWritePerformed, false);
  assert.equal(profile.calendarConnected, false);
  assert.equal(profile.paymentConnected, false);
  assert.equal(profile.messageSent, false);
  assert.match(profile.personalPath, /^\/hermes-connect\/preview\//);
});

test("requires at least one service and one availability slot", () => {
  const validation = validateProfileDraft({ ...defaultDraft, serviceIds: [], availability: [] });
  assert.equal(validation.valid, false);
  assert.deepEqual(validation.errors, ["service_required", "availability_required"]);
});

test("creates a test booking only from profile availability", () => {
  const profile = createProfilePreview(defaultDraft);
  const booking = createTestBookingForProfile(profile, {
    serviceId: profile.services[0].id,
    time: profile.availability[0],
  });
  assert.equal(booking.status, "test_booking_created");
  assert.equal(booking.externalWritePerformed, false);
  assert.throws(
    () => createTestBookingForProfile(profile, { serviceId: profile.services[0].id, time: "Friday" }),
    /Time is not available/,
  );
});
