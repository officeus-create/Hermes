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
  assert.deepEqual(names, ['get_product_overview','recommend_start_path','get_hermes_business_routes','get_product_learning_policy','submit_product_feedback']);
  assert.equal(json.result.tools[0].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[2].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[3].annotations.readOnlyHint, true);
  assert.equal(json.result.tools[4].annotations.readOnlyHint, false);
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
        bind(...args){ return { async run(){ rows.push({sql,args}); return {success:true}; } }; },
        async run(){ rows.push({sql,args:[]}); return {success:true}; }
      };
    }
  };
  const { json } = await call({jsonrpc:'2.0',id:7,method:'tools/call',params:{name:'submit_product_feedback',arguments:{business_type:'home services',problem_class:'post estimate follow up',desired_capability:'automatic reminder after two days',outcome:'missing_capability',consent_to_product_learning:true}}}, {DB:db});
  assert.equal(json.result.structuredContent.accepted, true);
  assert.equal(json.result.structuredContent.status, 'stored_privacy_safe_product_learning_event');
  assert.equal('receipt_id' in json.result.structuredContent, false);
  assert.equal(rows.length, 3);
  assert.match(rows[1].sql, /DELETE FROM plugin_product_learning_events/);
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
