// Page-lifetime state only: private submission values never enter localStorage/analytics.
export function createCatalogPendingSubmission() {
 let pending=null,inFlight=false,reviewRequired=false,completed=false;
 return {
  get inFlight(){return inFlight;},get reviewRequired(){return reviewRequired;},
  begin(payload){
   if(inFlight)return {error:'in_flight'};
   if(completed)return {error:'completed'};
   if(reviewRequired)return {error:'review_required'};
   const {request_id,submitted_at,...fields}=payload,signature=JSON.stringify(fields);
   if(pending&&pending.signature!==signature)return {error:'pending_changed'};
   if(!pending)pending={signature,payload:JSON.parse(JSON.stringify(payload))};
   inFlight=true;return {payload:JSON.parse(JSON.stringify(pending.payload))};
  },
  settle(httpOk,body){
   inFlight=false;
   if(!pending||body?.request_id!==pending.payload.request_id){reviewRequired=true;return 'review_required';}
   if(httpOk&&body.success===true){completed=true;return 'accepted';}
   if(!httpOk&&body.success===false&&body.error==='invalid_lead'&&body.delivery_status==='rejected'&&body.crm_saved===false&&body.correction_allowed===true){pending=null;return 'rejected';}
   if(!httpOk&&body.success===false&&body.error==='delivery_in_progress'&&body.crm_saved===true)return 'in_progress';
   if(body.success===false&&body.retryable===true)return body.crm_saved?'saved_retryable':'retryable';
   reviewRequired=true;return 'review_required';
  },
  networkFailure(){inFlight=false;/* Reuse original ID: durable server receipt decides whether another send is safe. */}
 };
}
