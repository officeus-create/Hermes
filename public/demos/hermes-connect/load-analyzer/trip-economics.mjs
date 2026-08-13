const numberFields = [
  "loadedMiles",
  "deadheadMiles",
  "grossPay",
  "fuelPrice",
  "mpg",
  "reservePerMile",
  "fixedCosts",
  "servicePercent",
  "paymentFeePercent",
  "targetNet",
];

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

export function normalizeTripInputs(input = {}) {
  const normalized = {};
  for (const field of numberFields) normalized[field] = toNumber(input[field]);
  return normalized;
}

export function validateTripInputs(input = {}) {
  const values = normalizeTripInputs(input);
  const errors = [];

  if (!Number.isFinite(values.loadedMiles) || values.loadedMiles <= 0) errors.push("loaded_miles_invalid");
  if (!Number.isFinite(values.deadheadMiles) || values.deadheadMiles < 0) errors.push("deadhead_miles_invalid");
  if (!Number.isFinite(values.grossPay) || values.grossPay <= 0) errors.push("gross_pay_invalid");
  if (!Number.isFinite(values.fuelPrice) || values.fuelPrice < 0) errors.push("fuel_price_invalid");
  if (!Number.isFinite(values.mpg) || values.mpg <= 0) errors.push("mpg_invalid");
  if (!Number.isFinite(values.reservePerMile) || values.reservePerMile < 0) errors.push("reserve_invalid");
  if (!Number.isFinite(values.fixedCosts) || values.fixedCosts < 0) errors.push("fixed_costs_invalid");
  if (!Number.isFinite(values.servicePercent) || values.servicePercent < 0 || values.servicePercent >= 100) errors.push("service_percent_invalid");
  if (!Number.isFinite(values.paymentFeePercent) || values.paymentFeePercent < 0 || values.paymentFeePercent >= 100) errors.push("payment_fee_percent_invalid");
  if (!Number.isFinite(values.targetNet) || values.targetNet < 0) errors.push("target_net_invalid");
  if (values.servicePercent + values.paymentFeePercent >= 100) errors.push("combined_percentage_invalid");

  return { valid: errors.length === 0, errors, values };
}

export function calculateTripEconomics(input = {}) {
  const validation = validateTripInputs(input);
  if (!validation.valid) {
    const error = new Error(`Trip economics validation failed: ${validation.errors.join(", ")}`);
    error.validationErrors = validation.errors;
    throw error;
  }

  const {
    loadedMiles,
    deadheadMiles,
    grossPay,
    fuelPrice,
    mpg,
    reservePerMile,
    fixedCosts,
    servicePercent,
    paymentFeePercent,
    targetNet,
  } = validation.values;

  // Formula parity with the public Hermes RPM & Load Profitability Calculator:
  // total miles, loaded/all-mile RPM, fuel, reserve, service fee, direct cost,
  // operating cost, estimated net, and break-even all use the same equations.
  // paymentFeePercent is an additional user-entered cost and defaults to zero in the UI.
  const totalMiles = loadedMiles + deadheadMiles;
  const grossLoadedRpm = grossPay / loadedMiles;
  const allMileRpm = grossPay / totalMiles;
  const fuelCost = (totalMiles / mpg) * fuelPrice;
  const reserveCost = totalMiles * reservePerMile;
  const serviceFee = grossPay * (servicePercent / 100);
  const paymentFee = grossPay * (paymentFeePercent / 100);
  const directCosts = fuelCost + reserveCost + fixedCosts;
  const operatingCost = directCosts + serviceFee + paymentFee;
  const estimatedNet = grossPay - operatingCost;
  const retainedShare = 1 - ((servicePercent + paymentFeePercent) / 100);
  const breakEvenGross = directCosts / retainedShare;
  const breakEvenLoadedRpm = breakEvenGross / loadedMiles;
  const breakEvenAllMileRpm = breakEvenGross / totalMiles;
  const deadheadShare = totalMiles > 0 ? deadheadMiles / totalMiles : 0;

  const recommendation = estimatedNet < 0
    ? "BAD"
    : estimatedNet >= targetNet
      ? "GOOD"
      : "BORDERLINE";

  const recommendationReason = recommendation === "GOOD"
    ? `Estimated net meets or exceeds your $${targetNet.toFixed(0)} target.`
    : recommendation === "BORDERLINE"
      ? `Estimated net is positive but below your $${targetNet.toFixed(0)} target.`
      : "Entered costs exceed gross pay for this trip.";

  const sensitivity = deadheadShare >= 0.25
    ? `Deadhead is ${Math.round(deadheadShare * 100)}% of all miles, so all-mile RPM is materially lower than loaded RPM.`
    : deadheadMiles > 0
      ? `Deadhead is ${Math.round(deadheadShare * 100)}% of all miles. Compare all-mile RPM, not loaded RPM alone.`
      : servicePercent + paymentFeePercent > 0
        ? "No deadhead is entered. User-entered percentage fees are still included in net and break-even estimates."
        : "No deadhead or percentage fees are entered; fuel, reserve, and fixed-cost assumptions drive the estimate.";

  return {
    totalMiles,
    grossLoadedRpm,
    allMileRpm,
    fuelCost,
    reserveCost,
    serviceFee,
    paymentFee,
    directCosts,
    operatingCost,
    estimatedNet,
    breakEvenGross,
    breakEvenLoadedRpm,
    breakEvenAllMileRpm,
    deadheadPercent: deadheadShare * 100,
    targetNet,
    recommendation,
    recommendationReason,
    sensitivity,
  };
}
