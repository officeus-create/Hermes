/** Submitter-supplied cargo weight; never a verified measurement or carrier qualification. */
export type BrokerWeight = { state: 'unknown'; value: ''; unit: '' } | { state: 'known'; value: string; unit: 'lb' | 'kg' };

export function validateBrokerWeight(input: unknown): BrokerWeight {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid broker weight.');
  const record = input as Record<string, unknown>;
  if (Object.keys(record).sort().join(',') !== 'state,unit,value') throw new Error('Invalid broker weight fields.');
  const { state, value, unit } = record;
  if (state === 'unknown' && value === '' && unit === '') return { state, value, unit };
  if (state === 'known' && typeof value === 'string' && value.length <= 24 && /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) && Number(value) > 0 && (unit === 'lb' || unit === 'kg')) return { state, value, unit };
  throw new Error('Invalid broker weight: provide a positive decimal and lb/kg, or unknown with empty value/unit.');
}

export function brokerWeightFromForm(data: FormData): BrokerWeight | undefined {
  const names = ['broker_weight_state', 'broker_weight_value', 'broker_weight_unit'];
  if (!names.some(name => data.has(name))) return undefined; // Existing generic intake remains compatible.
  if (data.getAll('submitter_type').length !== 1 || data.get('submitter_type') !== 'broker' || names.some(name => data.getAll(name).length !== 1)) throw new Error('Invalid broker weight: broker segment and single fields required.');
  return validateBrokerWeight({ state: data.get(names[0]), value: data.get(names[1]), unit: data.get(names[2]) });
}

export function brokerWeightSummary(weight: BrokerWeight): string {
  return `Broker cargo weight (submitter supplied, unverified): ${weight.state === 'known' ? `${weight.value} ${weight.unit}` : 'unknown'}`;
}

/** Remove only the matching client summary; the receiver renders the authoritative block. */
export function brokerWeightEmailBody(body: string, weight?: BrokerWeight): string {
  const lines = body.split(/\r?\n/);
  const summaries = lines.filter(line => /^\s*Broker cargo weight/i.test(line));
  if (/^\s*Broker weight record:/im.test(body)) throw new Error('Invalid broker weight record in client body.');
  if (!weight) {
    if (summaries.length) throw new Error('Missing broker weight record.');
    return body;
  }
  const summary = brokerWeightSummary(weight);
  if (summaries.length !== 1 || summaries[0] !== summary) throw new Error('Conflicting or missing broker weight summary.');
  return lines.filter(line => line !== summary).join('\n');
}
