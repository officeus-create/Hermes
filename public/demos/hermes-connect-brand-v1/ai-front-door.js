/**
 * Hermes Connect — Front-Door AI Brain Intent Router
 * Categorizes incoming intent signals across 5 industry verticals and generates automated actions.
 */

window.HermesAIBrain = (function () {
  const VERTICALS = {
    beauty: {
      name: 'Beauty & Wellness',
      keywords: ['booking', 'appointment', 'salon', 'hair', 'nails', 'massage', 'facial', 'stylist', 'deposit', 'aurelia'],
      suggestedActions: [
        { label: 'Prepare booking link + $25 deposit', type: 'booking' },
        { label: 'Offer Friday 2:00 PM gap slot', type: 'calendar' },
        { label: 'Send automated retention reminder', type: 'marketing' }
      ]
    },
    auto: {
      name: 'Auto Repair & Detailing',
      keywords: ['repair', 'brake', 'oil', 'inspection', 'estimate', 'parts', 'vehicle', 'vin', 'detailing', 'apex'],
      suggestedActions: [
        { label: 'Generate digital repair estimate ($480)', type: 'estimate' },
        { label: 'Assign Bay 2 for 9:00 AM inspection', type: 'operations' },
        { label: 'Send SMS quote approval request', type: 'crm' }
      ]
    },
    logistics: {
      name: 'US Logistics & Load Board',
      keywords: ['load', 'freight', 'rate', 'carrier', 'truck', 'driver', 'reefer', 'flatbed', 'hotshot', 'dispatch', 'chicago', 'dallas'],
      suggestedActions: [
        { label: 'Parse email rate confirmation → Load Card', type: 'load_parse' },
        { label: 'Match nearest driver (Driver #104 · 12 miles away)', type: 'driver_match' },
        { label: 'Send bid $2,400 to broker via EDI/Email', type: 'bid' }
      ]
    },
    fitness: {
      name: 'Fitness & Coaching',
      keywords: ['workout', 'training', 'membership', 'trainer', 'class', 'gym', 'fitness', 'northline'],
      suggestedActions: [
        { label: 'Schedule 1-on-1 trial workout', type: 'booking' },
        { label: 'Send 14-day reactivation offer', type: 'marketing' },
        { label: 'Assign coach Alex for assessment', type: 'operations' }
      ]
    },
    marketing: {
      name: 'Marketing & SEO',
      keywords: ['lead', 'campaign', 'ad', 'seo', 'conversion', 'google', 'traffic', 'growth', 'progresso'],
      suggestedActions: [
        { label: 'Analyze campaign ROI (3.8x projected)', type: 'analytics' },
        { label: 'Generate short-form video script', type: 'creative' },
        { label: 'Launch WhatsApp retargeting flow', type: 'crm' }
      ]
    }
  };

  function classifyIntent(text) {
    if (!text || typeof text !== 'string') {
      return { vertical: 'beauty', confidence: 0.5, meta: VERTICALS.beauty };
    }

    const lower = text.toLowerCase();
    let bestVertical = 'beauty';
    let maxScore = 0;

    Object.keys(VERTICALS).forEach((key) => {
      const v = VERTICALS[key];
      let score = 0;
      v.keywords.forEach((kw) => {
        if (lower.includes(kw)) score += 1;
      });
      if (score > maxScore) {
        maxScore = score;
        bestVertical = key;
      }
    });

    const confidence = maxScore > 0 ? Math.min(0.95, 0.6 + maxScore * 0.15) : 0.65;

    return {
      vertical: bestVertical,
      confidence: confidence,
      meta: VERTICALS[bestVertical],
      rawText: text
    };
  }

  function generateResponse(intentResult) {
    const v = intentResult.meta;
    const verticalName = v.name;
    const actions = v.suggestedActions;

    return {
      verticalKey: intentResult.vertical,
      summary: `[AI Brain] Categorized intent as ${verticalName} (${Math.round(intentResult.confidence * 100)}% confidence).`,
      message: `Hermes identified a high-priority request for **${verticalName}**. Suggested automated response prepared.`,
      actions: actions
    };
  }

  return {
    classifyIntent: classifyIntent,
    generateResponse: generateResponse,
    VERTICALS: VERTICALS
  };
})();
