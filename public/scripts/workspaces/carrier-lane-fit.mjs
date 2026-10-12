// Hermes-owned lightweight, explainable planning aid.
// The server still owns all freight entitlements and dispatcher confirmations.
const stateFromCityLabel = (label) => {
  const match = String(label || "").toUpperCase().match(/(?:,\s*|\s+)([A-Z]{2})$/);
  return match ? match[1] : null;
};
export function laneFit(load, preferences) {
  const rules = [
    {key:"originState", label:"Origin state", actual:stateFromCityLabel(load.origin), weight:3},
    {key:"destinationState", label:"Destination state", actual:stateFromCityLabel(load.destination), weight:3},
    {key:"equipment", label:"Equipment", actual:String(load.equipment || "").toLowerCase() || null,weight:2},
  ];
  let score=0,matching=0,mismatched=0,unknown=0;
  const details=[];
  for(const rule of rules) {
    const preferred=preferences?.[rule.key] || null;
    if(!preferred)continue;
    if(!rule.actual) {
      unknown++;
      details.push(rule.label+": not available for comparison");
    }else if(String(rule.actual).toUpperCase()===String(preferred).toUpperCase()) {
      score+=rule.weight;matching++;
      details.push(rule.label+": matches");
    }else {
      score-=rule.weight;mismatched++;
      details.push(rule.label+": outside preference");
    }
  }
  const slots=preferences?.availableSlots;
  if(Number.isInteger(slots) && slots > 0) {
    if(!Number.isInteger(load.vehicleCount) || load.vehicleCount < 1) {
      unknown++;details.push("Trailer slots: vehicle count unconfirmed");
    }else if(load.vehicleCount<=slots) {
      score+=2;matching++;details.push("Trailer slots: within stated capacity");
    }else {
      score-=4;mismatched++;details.push("Trailer slots: exceeds stated capacity");
    }
  }
  return {score,matching,mismatched,unknown,details,
    configured:rules.some(r=>Boolean(preferences?.[r.key])) || (Number.isInteger(slots)&&slots>0),
    // This is ONLY preference compatibility, not feasibility, availability or an accepted load.
    dispatchConfirmationRequired:true};
}
export function sortByLaneFit(loads,preferences){
  return [...loads].map((load,index)=>({load,index,fit:laneFit(load,preferences)}))
    .sort((a,b)=>b.fit.score-a.fit.score || a.index-b.index);
}
