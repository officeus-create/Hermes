/**
 * Hermes Connect — Front-Door AI Brain Intent Router
 * Categorizes incoming intent signals across 7 industry verticals and generates automated actions.
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
    },
    agency: {
      name: 'Agency & Digital Services',
      keywords: ['agency', 'client', 'retainer', 'proposal', 'audit', 'scope', 'contract', 'growth'],
      suggestedActions: [
        { label: 'Generate agency client proposal', type: 'proposal' },
        { label: 'Schedule strategy kickoff call', type: 'calendar' },
        { label: 'Send technical audit scorecard', type: 'analytics' }
      ]
    },
    realestate: {
      name: 'Real Estate & Properties',
      keywords: ['listing', 'property', 'showing', 'tour', 'buyer', 'seller', 'lease', 'meridian'],
      suggestedActions: [
        { label: 'Schedule private property showing', type: 'booking' },
        { label: 'Send digital buyer brochure', type: 'crm' },
        { label: 'Qualify pre-approval status', type: 'operations' }
      ]
    }
  };

  function classifyIntent(text, hintVertical) {
    const defaultVert = (hintVertical && VERTICALS[hintVertical]) ? hintVertical : 'beauty';
    if (!text || typeof text !== 'string') {
      const meta = VERTICALS[defaultVert];
      return {
        vertical: defaultVert,
        confidence: 0.85,
        meta: meta,
        rawText: text || '',
        verticalLabel: meta.name,
        actionText: meta.suggestedActions[0]?.label || 'Route lead to workspace pipeline.',
        recommendation: meta.suggestedActions[0]?.label || 'Standard routing',
        intent: defaultVert.toUpperCase() + '_INQUIRY'
      };
    }

    const lower = text.toLowerCase();
    let bestVertical = defaultVert;
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

    const confidence = maxScore > 0 ? Math.min(0.95, 0.65 + maxScore * 0.12) : 0.85;
    const meta = VERTICALS[bestVertical];

    return {
      vertical: bestVertical,
      confidence: confidence,
      meta: meta,
      rawText: text,
      verticalLabel: meta.name,
      actionText: meta.suggestedActions[0]?.label || 'Route lead to workspace pipeline.',
      recommendation: meta.suggestedActions[0]?.label || 'Standard routing',
      intent: bestVertical.toUpperCase() + '_INQUIRY'
    };
  }

  function generateResponse(intentResult) {
    const v = intentResult.meta || VERTICALS[intentResult.vertical] || VERTICALS.beauty;
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

