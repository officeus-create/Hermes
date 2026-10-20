import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBatch, projectCandidate } from './paperclip-pilot-candidates.mjs';

const sample = Object.freeze({
 source_id:'HERMES-PILOT-001', source_url:'https://github.com/officeus-create/Hermes/issues/0',
 title:'Check synthetic homepage visual accessibility contract', department:'QA', data_classification:'SYNTHETIC',
 owner:'codex', qa_owner:'qa-independent', approved:true,
 acceptance:['Review the result against a synthetic baseline'],
});

test('one review-only task maps with zero-cost and action locks', () => {
 const actual = projectCandidate(sample);
 assert.equal(actual.execution,'REVIEW_ONLY');
 assert.equal(actual.api_writes_enabled,false);
 assert.equal(actual.scheduled_agents_enabled,false);
 assert.equal(actual.estimated_external_cost_usd,0);
 assert.equal(actual.source_url,sample.source_url);
});
test('rejects unexpected untrusted input fields in output', () => {
 const result=projectCandidate({...sample, token:'must-not-leak', email:'private@example.com'});
 assert.equal('token' in result,false); assert.equal('email' in result,false);
});
test('rejects protected data and malformed references',()=>{
 for (const patch of [{data_classification:'PRIVATE'}, {source_url:'https://evil.invalid/steal'}, {approved:false},{owner:'qa-independent'}])
  assert.throws(()=>projectCandidate({...sample,...patch}));
});
test('rejects duplicate tasks and batch sprawl',()=>{
 assert.throws(()=>buildBatch([sample,sample]));
 assert.throws(()=>buildBatch([]));
 assert.throws(()=>buildBatch(Array(4).fill(sample)));
});
