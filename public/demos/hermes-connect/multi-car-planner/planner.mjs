export const plannerOptions = Object.freeze({
  timing: Object.freeze(["flexible", "standard", "narrow"]),
  equipmentPreference: Object.freeze(["review", "open", "enclosed"]),
  facilityAccess: Object.freeze(["standard", "appointment", "restricted"]),
  movementType: Object.freeze(["one_time", "repeat"]),
  businessType: Object.freeze(["dealer", "auction", "fleet", "business", "private_owner"]),
});

function integer(value, name, min, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error(`${name} must be a whole number from ${min} to ${max}`);
  return parsed;
}

function option(value, name, allowed) {
  if (!allowed.includes(value)) throw new Error(`${name} is invalid`);
  return value;
}

export function analyzeMultiCarPlan(input = {}) {
  const vehicleCount = integer(input.vehicleCount, "vehicleCount", 2, 30);
  const inoperableCount = integer(input.inoperableCount ?? 0, "inoperableCount", 0, 30);
  const pickupLocations = integer(input.pickupLocations ?? 1, "pickupLocations", 1, 10);
  const deliveryLocations = integer(input.deliveryLocations ?? 1, "deliveryLocations", 1, 10);
  if (inoperableCount > vehicleCount) throw new Error("inoperableCount cannot exceed vehicleCount");

  const timing = option(input.timing, "timing", plannerOptions.timing);
  const equipmentPreference = option(input.equipmentPreference, "equipmentPreference", plannerOptions.equipmentPreference);
  const facilityAccess = option(input.facilityAccess, "facilityAccess", plannerOptions.facilityAccess);
  const movementType = option(input.movementType, "movementType", plannerOptions.movementType);
  const businessType = option(input.businessType, "businessType", plannerOptions.businessType);

  let complexityPoints = 0;
  if (vehicleCount >= 3) complexityPoints += 1;
  if (vehicleCount >= 7) complexityPoints += 1;
  if (inoperableCount > 0) complexityPoints += 2;
  const locationCount = pickupLocations + deliveryLocations;
  if (locationCount > 2) complexityPoints += 1;
  if (locationCount > 4) complexityPoints += 1;
  if (timing === "narrow") complexityPoints += 2;
  if (facilityAccess !== "standard") complexityPoints += 1;
  if (equipmentPreference === "enclosed") complexityPoints += 1;
  if (movementType === "repeat") complexityPoints += 1;

  const coordinationTier = complexityPoints <= 2 ? "STANDARD_REVIEW" : complexityPoints <= 5 ? "COORDINATED_REVIEW" : "COMPLEX_REVIEW";
  const readiness = [];
  readiness.push(`Prepare a complete unit list for all ${vehicleCount} vehicles.`);
  readiness.push("Confirm each vehicle's year, make, model, condition, and operability before carrier review.");
  readiness.push(`Confirm ${pickupLocations} pickup location${pickupLocations === 1 ? "" : "s"} and ${deliveryLocations} delivery location${deliveryLocations === 1 ? "" : "s"}, including hours and access rules.`);
  if (inoperableCount > 0) readiness.push(`Flag the ${inoperableCount} inoperable vehicle${inoperableCount === 1 ? "" : "s"}; loading requirements need separate review.`);
  if (timing === "narrow") readiness.push("Provide the exact pickup/delivery window and any deadline that makes timing non-flexible.");
  if (facilityAccess === "appointment") readiness.push("Collect appointment instructions and facility contact requirements before dispatch review.");
  if (facilityAccess === "restricted") readiness.push("Document restricted access, loading-space limits, gate rules, or receiving constraints before carrier matching.");
  if (equipmentPreference === "enclosed") readiness.push("Treat enclosed service as a preference subject to fit, route, access, timing, compliance, and availability review.");
  if (movementType === "repeat") readiness.push("For repeat movements, define expected cadence and what information stays stable versus changes for each move.");

  const stagedReview = vehicleCount >= 7 || locationCount > 2 || inoperableCount > 0 || facilityAccess === "restricted";
  const arrangementNote = stagedReview
    ? "This request should be reviewed for one-versus-multiple equipment or staged coordination. The planner does not decide truck count or carrier capacity."
    : "This request can proceed to equipment/capacity review. The planner does not guarantee one truck, carrier capacity, price, pickup, delivery, or booking.";

  const timingNote = timing === "flexible"
    ? "Flexible timing can be presented as a planning preference, but actual pickup/delivery depends on confirmed carrier capacity and facility constraints."
    : timing === "narrow"
      ? "A narrow window increases coordination requirements; do not present it as a guaranteed pickup or delivery commitment."
      : "Standard timing still requires carrier and facility confirmation before any commitment.";

  return {
    vehicleCount,
    inoperableCount,
    pickupLocations,
    deliveryLocations,
    timing,
    equipmentPreference,
    facilityAccess,
    movementType,
    businessType,
    complexityPoints,
    coordinationTier,
    readiness,
    stagedReview,
    arrangementNote,
    timingNote,
  };
}
