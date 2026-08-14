/**
 * Hermes Connect — Email & SMS Freight Load Parser
 * Converts raw email/SMS rate confirmations into structured Load Board cards and matches nearby drivers.
 */

window.HermesEmailLoadParser = (function () {
  const SAMPLE_EMAILS = [
    {
      title: 'CH Robinson Rate Confirmation - Reefer Load',
      text: 'RATE CONFIRMATION #982410\nOrigin: Chicago, IL (60609)\nDestination: Dallas, TX (75201)\nPickup: Tomorrow 08:00 CST\nDelivery: Next Day 14:00 CST\nEquipment: 53ft Reefer (-10F)\nWeight: 42,500 lbs\nRate: $2,850.00 All-In\nCommodity: Frozen Poultry'
    },
    {
      title: 'TQL Spot Market Offer - Dry Van',
      text: 'SPOT LOAD OFFER\nFrom: Milwaukee, WI\nTo: Atlanta, GA\nDistance: 780 miles\nTrailer: Dry Van\nWeight: 36,000 lbs\nRate: $2,100\nPickup Today by 16:00'
    },
    {
      title: 'Car Hauling Rate Lock - Auto Transporter',
      text: 'VEHICLE TRANSPORT ORDER #4412\nOrigin: Indianapolis, IN\nDestination: Miami, FL\nVehicles: 3x 2024 Ford F-150\nEquipment: 3-Car Wedge / Enclosed\nRate: $3,200\nPickup ASAP'
    }
  ];

  function parseText(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;

    const lower = rawText.toLowerCase();

    // Origin / Destination extraction
    let origin = 'Chicago, IL';
    let destination = 'Dallas, TX';
    const originMatch = rawText.match(/(?:origin|from):\s*([A-Za-z\s]+,\s*[A-Z]{2})/i);
    if (originMatch && originMatch[1]) origin = originMatch[1].trim();

    const destMatch = rawText.match(/(?:destination|to):\s*([A-Za-z\s]+,\s*[A-Z]{2})/i);
    if (destMatch && destMatch[1]) destination = destMatch[1].trim();

    // Rate extraction
    let rate = 2850;
    const rateMatch = rawText.match(/\$([\d,]+(?:\.\d{2})?)/);
    if (rateMatch && rateMatch[1]) {
      rate = parseFloat(rateMatch[1].replace(/,/g, ''));
    }

    // Equipment extraction
    let equipment = '53ft Reefer';
    if (lower.includes('reefer') || lower.includes('frozen') || lower.includes('temperature')) {
      equipment = '53ft Reefer';
    } else if (lower.includes('dry van') || lower.includes('van')) {
      equipment = '53ft Dry Van';
    } else if (lower.includes('flatbed') || lower.includes('stepdeck')) {
      equipment = '48ft Flatbed';
    } else if (lower.includes('car') || lower.includes('vehicle') || lower.includes('wedge')) {
      equipment = 'Auto Transporter';
    } else if (lower.includes('hotshot')) {
      equipment = '40ft Hotshot';
    }

    // Weight extraction
    let weight = '42,500 lbs';
    const weightMatch = rawText.match(/([\d,]+\s*(?:lbs|lb|k))/i);
    if (weightMatch && weightMatch[1]) weight = weightMatch[1].trim();

    // Distance estimation
    const distanceMiles = Math.round(750 + Math.random() * 200);
    const ratePerMile = (rate / distanceMiles).toFixed(2);

    // Driver match simulation
    const nearbyDrivers = [
      { id: 'DRV-104', name: 'Mikhail V.', truck: '2023 Volvo VNL 860', distanceAwayMiles: 14, status: 'Ready (HOS 11h)' },
      { id: 'DRV-208', name: 'John D.', truck: '2022 Freightliner Cascadia', distanceAwayMiles: 28, status: 'Unloading (Ready in 1h)' }
    ];

    return {
      id: 'L-' + Math.floor(100000 + Math.random() * 900000),
      origin: origin,
      destination: destination,
      rate: rate,
      formattedRate: '$' + rate.toLocaleString(),
      equipment: equipment,
      weight: weight,
      estimatedMiles: distanceMiles,
      ratePerMile: '$' + ratePerMile + '/mi',
      matchedDrivers: nearbyDrivers,
      parsedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawSnippet: rawText.substring(0, 120) + '...'
    };
  }

  return {
    SAMPLE_EMAILS: SAMPLE_EMAILS,
    parseText: parseText
  };
})();
