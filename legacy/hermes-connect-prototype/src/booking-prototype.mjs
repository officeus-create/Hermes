export const specialist = {
  id: "specialist-maya-santos",
  name: "Maya Santos",
  role: "Business consultant",
  location: "Miami / Remote",
  services: ["Strategy session", "Operations review", "Website consultation"],
  availability: ["Tue · 10:30 AM", "Tue · 2:00 PM", "Wed · 9:00 AM"],
};

export function createTestBooking({ specialistId, service, time }) {
  if (specialistId !== specialist.id) throw new Error("Unknown specialist");
  if (!specialist.services.includes(service)) throw new Error("Unknown service");
  if (!specialist.availability.includes(time)) throw new Error("Unavailable time");

  return {
    id: `TEST-${specialistId}-${specialist.services.indexOf(service) + 1}-${specialist.availability.indexOf(time) + 1}`,
    mode: "simulation",
    status: "test_booking_created",
    specialist: specialist.name,
    service,
    time,
    externalWritePerformed: false,
    calendarEventCreated: false,
    paymentCreated: false,
    messageSent: false,
  };
}
