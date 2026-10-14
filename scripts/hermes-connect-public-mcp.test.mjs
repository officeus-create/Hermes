import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/hermes-connect/mcp.ts';

const call = async (body, env = {}, headers = {}) => {
  const request = new Request('https://hermeslogisticsus.com/api/hermes-connect/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const response = await onRequest({ request, env });
  return { response, json: response.status === 202 ? null : await response.json() };
};

{
  const { response, json } = await call({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'test',version:'1'}}});
  assert.equal(response.status, 200);
  assert.equal(json.result.protocolVersion, '2025-06-18');
  assert.equal(json.result.serverInfo.name, 'hermes-connect');
}

{
  const { json } = await call({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
  const names = json.result.tools.map((tool) => tool.name);
  assert.deepEqual(names, ['get_product_overview','recommend_start_path','build_crm_onboarding_plan','preview_crm_funnel','get_hermes_business_routes','get_product_learning_policy','submit_product_feedback']);
  assert.equal(json.result.tools[0].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[2].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[3].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[4].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[5].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[6].annotations.readOnlyHint, false);
}

{
  const { json } = await call({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'recommend_start_path',arguments:{business_type:'auto repair shop',primary_goal:'reduce missed bookings'}}});
  assert.equal(json.result.structuredContent.route, 'LIVE_REPAIR_SHOPS');
}

{
  const { json } = await call({jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'recommend_start_path',arguments:{business_type:'roofing company',primary_goal:'leads are not followed up'}}});
  assert.equal(json.result.structuredContent.route, 'CRM_BLUEPRINT');
}

{
  const { json } = await call({jsonrpc:'2.0',id:41,method:'tools/call',params:{name:'recommend_start_path',arguments:{business_type:'roofing company',primary_goal:'improve ads and website traffic'}}});
  assert.equal(json.result.structuredContent.route, 'HERMES_MARKETING');
}

{
  const { json } = await call({jsonrpc:'2.0',id:5,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'home services',problem_class:'post estimate follow up',desired_capability:'automatic reminder after two days',outcome:'missing_capability',consent_to_product_learning:false}}});
  assert.equal(json.result.structuredContent.accepted, false);
  assert.equal(json.result.structuredContent.status, 'explicit_consent_required');
}

{
  const { json } = await call({jsonrpc:'2.0',id:6,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'shop owner john@example.com',problem_class:'follow up',desired_capability:'reminder',outcome:'missing_capability',consent_to_product_learning:true}}});
  assert.equal(json.result.structuredContent.accepted, false);
  assert.equal(json.result.structuredContent.status, 'feedback_contains_disallowed_sensitive_pattern');
}

{
  const rows=[];
  const db={
    prepare(sql){
      return {
        bind(...args){
          return {
            async run(){ rows.push({sql,args,kind:'run'}); return {success:true}; },
            async first(){
              rows.push({sql,args,kind:'first'});
              if (/COUNT\(\*\)/.test(sql)) return {count:0};
              return null;
            }
          };
        },
        async run(){ rows.push({sql,args:[],kind:'run'}); return {success:true}; }
      };
    }
  };
  const { json } = await call({jsonrpc:'2.0',id:7,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'home services',problem_class:'post estimate follow up',desired_capability:'automatic reminder after two days',outcome:'missing_capability',consent_to_product_learning:true}}}, {DB:db});
  assert.equal(json.result.structuredContent.accepted, true);
  assert.equal(json.result.structuredContent.status, 'stored_privacy_safe_product_learning_event');
  assert.equal('receipt_id' in json.result.structuredContent, false);
  assert.equal(rows.length, 5);
  assert.match(rows[1].sql, /DELETE FROM plugin_product_learning_events/);
  assert.match(rows[2].sql, /COUNT\(\*\)/);
  assert.match(rows[3].sql, /SELECT id FROM plugin_product_learning_events/);
}

{
  const db={
    prepare(sql){
      return {
        bind(...args){
          return {
            async run(){ return {success:true}; },
            async first(){
              if (/COUNT\(\*\)/.test(sql)) return {count:120};
              return null;
            }
          };
        },
        async run(){ return {success:true}; }
      };
    }
  };
  const { json } = await call({jsonrpc:'2.0',id:71,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'home services',problem_class:'follow up leakage',desired_capability:'reminder',outcome:'workflow_friction',consent_to_product_learning:true}}}, {DB:db});
  assert.equal(json.result.structuredContent.accepted, false);
  assert.equal(json.result.structuredContent.status, 'learning_rate_limited');
}

{
  const db={
    prepare(sql){
      return {
        bind(...args){
          return {
            async run(){ return {success:true}; },
            async first(){
              if (/COUNT\(\*\)/.test(sql)) return {count:1};
              if (/SELECT id FROM plugin_product_learning_events/.test(sql)) return {id:'existing'};
              return null;
            }
          };
        },
        async run(){ return {success:true}; }
      };
    }
  };
  const { json } = await call({jsonrpc:'2.0',id:72,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'home services',problem_class:'follow up leakage',desired_capability:'reminder',outcome:'workflow_friction',consent_to_product_learning:true}}}, {DB:db});
  assert.equal(json.result.structuredContent.accepted, true);
  assert.equal(json.result.structuredContent.status, 'duplicate_product_learning_event');
}

{
  const { json } = await call({jsonrpc:'2.0',id:8,method:'server/discover',params:{_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}}}, {}, {'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'server/discover'});
  assert.equal(json.result.resultType, 'complete');
  assert.ok(json.result.supportedVersions.includes('2026-07-28'));
}

console.log('HERMES_CONNECT_PUBLIC_MCP_CONTRACT_PASS=YES');


{
  const { json } = await call({jsonrpc:'2.0',id:9,method:'tools/call',params:{name:'recommend_start_path',arguments:{business_type:'local contractor',primary_goal:'improve Google visibility and website leads'}}});
  assert.equal(json.result.structuredContent.route, 'HERMES_MARKETING');
}

{
  const { json } = await call({jsonrpc:'2.0',id:10,method:'tools/call',params:{name:'recommend_start_path',arguments:{business_type:'car hauling company',primary_goal:'improve carrier and dispatch operations'}}});
  assert.equal(json.result.structuredContent.route, 'HERMES_LOGISTICS');
}

{
  const { json } = await call({jsonrpc:'2.0',id:11,method:'tools/call',params:{name:'get_hermes_business_routes',arguments:{}}});
  assert.equal(json.result.structuredContent.routes.length, 4);
  assert.deepEqual(json.result.structuredContent.routes.map((route) => route.id), ['CONNECT','MARKETING','LOGISTICS','ACADEMY']);
}

{
  const { json } = await call({jsonrpc:'2.0',id:12,method:'tools/call',params:{name:'get_product_learning_policy',arguments:{}}});
  assert.ok(json.result.structuredContent.excluded_data.includes('raw full conversations'));
  assert.match(json.result.structuredContent.release_rule, /SkillCandidate|CapabilityCandidate/);
}


{
  const { json } = await call({jsonrpc:'2.0',id:13,method:'tools/call',params:{name:'build_crm_onboarding_plan',arguments:{business_type:'roofing company',primary_problem:'leads arrive from several places and follow-up is inconsistent',desired_outcome:'one measurable follow-up pipeline',existing_crm:false,current_stack:['Google Workspace']}}});
  const plan = json.result.structuredContent;
  assert.match(plan.strategy, /Problem -> concrete actions/);
  assert.equal(plan.do_now.length, 3);
  assert.match(plan.do_now[0], /customer journey|current CRM/);
  assert.ok(plan.need_from_you.length <= 5);
  assert.match(plan.build_execute, /CRM blueprint|source of truth/);
  assert.ok(plan.recommended_connections.some((item) => item.capability === 'Business email'));
  assert.equal(plan.recommended_connections.some((item) => item.capability === 'Marketing / analytics sources'), false);
  assert.match(plan.crm_bootstrap_prompt, /Use only the sources and connectors I explicitly approve/);
  assert.match(plan.continuity_rule, /durable provisioning job/);
  assert.match(plan.authorization_rule, /recommendation never grants access/);
}


{
  const { json } = await call({
    jsonrpc: '2.0', id: 81, method: 'tools/call',
    params: { name: 'preview_crm_funnel', arguments: {
      business_type: 'US car hauling carriers', goal: 'Increase qualified carriers', entry_channel: 'instagram'
    } }
  });
  const funnel = json.result.structuredContent;
  assert.equal(funnel.status, 'PREVIEW_ONLY');
  assert.equal(funnel.entry_channel, 'instagram');
  assert.equal(funnel.stages.length, 5);
  assert.equal(funnel.stages[0].name, 'Carrier inquiry');
  assert.match(funnel.stages[1].next_action, /authority, insurance, equipment/i);
  assert.match(funnel.stages[2].next_action, /do not promise available loads/i);
  assert.ok(funnel.stages.every(s => s.automation_state === 'NOT_CONNECTED'));
  assert.match(funnel.first_kpi, /exclude synthetic leads/i);
  assert.match(funnel.live_activation_gate, /active company\/workspace membership/);
  assert.match(funnel.not_performed.join(' '), /No emails.*sent/);
}

{
  const { json } = await call({
    jsonrpc: '2.0', id: 82, method: 'tools/call',
    params: { name: 'preview_crm_funnel', arguments: {
      business_type: 'auto repair shop', goal: 'reduce missed bookings', entry_channel: 'website'
    }, _meta: {'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}} }
  }, {}, {'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call','Mcp-Name':'preview_crm_funnel'});
  assert.equal(json.result.resultType, 'complete');
  assert.equal(json.result.structuredContent.status, 'PREVIEW_ONLY');
  assert.equal(json.result.structuredContent.stages[3].name, 'Booking');
  assert.match(json.result.structuredContent.stages[4].next_action, /opt-in/);
}

{
  // Without auth, personal data is not accepted as an MCP funnel request.
  const { json } = await call({
    jsonrpc: '2.0', id: 83, method: 'tools/call',
    params: { name: 'preview_crm_funnel', arguments: {
      business_type: 'John john@example.com', goal: 'send leads to +1 414 555 0199',
    } }
  });
  assert.equal(json.result.isError, true);
  assert.equal(json.result.structuredContent, undefined);
  assert.match(json.result.content[0].text, /could not complete this tool call/);
}

{
  const { response, json } = await call(
    {jsonrpc:'2.0',id:84,method:'tools/list',params:{}}, {},
    {'Origin':'https://malicious.example'});
  assert.equal(response.status, 403);
  assert.match(json.error.message, /Untrusted Origin/);
}
{
  const { response, json } = await call(
    {jsonrpc:'2.0',id:85,method:'tools/list',params:{}}, {},
    {'Origin':'https://hermeslogisticsus.com'});
  assert.equal(response.status, 200);
  assert.equal(json.result.tools.length, 7);
}
{
  const { response } = await call(
    {jsonrpc:'2.0',id:86,method:'tools/list',params:{}}, {},
    {'Origin':'https://trusted.example'});
  assert.equal(response.status, 403, 'unconfigured cross-origin host cannot access MCP');
}
{
  const { response, json } = await call(
    {jsonrpc:'2.0',id:87,method:'tools/list',params:{}},
    {MCP_ALLOWED_ORIGINS:'https://trusted.example'},
    {'Origin':'https://trusted.example'});
  assert.equal(response.status, 200);
  assert.ok(json.result.tools.length > 0);
}
{
  const body = {jsonrpc:'2.0',id:88,method:'tools/call',params:{
    name:'preview_crm_funnel',
    arguments:{business_type:'auto repair shop',goal:'confirm bookings'},
    _meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28'},
  }};
  const {response,json} = await call(body,{},{
    'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call',
    'Mcp-Name':'get_product_overview',
  });
  assert.equal(response.status,400);
  assert.equal(json.error.code,-32020);
  assert.equal(json.error.message,'HeaderMismatch');
}
{
  const body = {jsonrpc:'2.0',id:89,method:'tools/call',params:{
    name:'preview_crm_funnel',
    arguments:{business_type:'auto repair shop',goal:'confirm bookings'},
    _meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28'},
  }};
  for (const headers of [
    {'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/call'},
    {'MCP-Protocol-Version':'2026-07-28','Mcp-Method':'tools/list','Mcp-Name':'preview_crm_funnel'},
    {'Mcp-Method':'tools/call','Mcp-Name':'preview_crm_funnel'},
    {'MCP-Protocol-Version':'2025-06-18','Mcp-Method':'tools/call','Mcp-Name':'preview_crm_funnel'},
  ]) {
    const {response,json} = await call(body,{},headers);
    assert.equal(response.status,400,'reject missing/mismatched modern MCP header');
    assert.equal(json.error.code,-32020);
  }
}

{
  // Do not trust Content-Length for public MCP body limits: enforce bytes.
  const huge = new Request('https://hermeslogisticsus.com/api/hermes-connect/mcp', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      jsonrpc:'2.0', id:90, method:'tools/list',
      params:{padding:'x'.repeat(70000)}
    }),
  });
  const response = await onRequest({request:huge,env:{}});
  assert.equal(response.status,413,'actual untrusted request bytes must be capped');
}
{
  const encoded = new TextEncoder().encode('{"jsonrpc":"2.0","id":91,"method":"tools/list","params":{"padding":"' + 'A'.repeat(70000) + '"}}');
  const chunked = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded.subarray(0,32000));
      controller.enqueue(encoded.subarray(32000));
      controller.close();
    }
  });
  const hugeChunked = new Request('https://hermeslogisticsus.com/api/hermes-connect/mcp', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:chunked,
    duplex:'half',
  });
  const response = await onRequest({request:hugeChunked,env:{}});
  assert.equal(response.status,413,'streamed bytes must be capped even with no declared length');
}
