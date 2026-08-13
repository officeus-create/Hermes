import test from "node:test";
import assert from "node:assert/strict";
import { createTestBooking, specialist } from "../src/booking-prototype.mjs";

test("creates an in-memory test booking without external actions", () => {
  const booking = createTestBooking({
    specialistId: specialist.id,
    service: specialist.services[0],
    time: specialist.availability[0],
  });
  assert.equal(booking.status, "test_booking_created");
  assert.equal(booking.externalWritePerformed, false);
  assert.equal(booking.calendarEventCreated, false);
  assert.equal(booking.paymentCreated, false);
  assert.equal(booking.messageSent, false);
});

test("rejects a time outside the specialist availability", () => {
  assert.throws(
    () => createTestBooking({ specialistId: specialist.id, service: specialist.services[0], time: "Friday" }),
    /Unavailable time/,
  );
});
