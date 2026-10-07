import assert from 'node:assert/strict';
import { measurementDeployment } from './verify-lighthouse-release.mjs';

const good = { id: 101, head_sha: 'new', head_branch: 'main', status: 'completed', conclusion: 'success' };
assert.equal(measurementDeployment('new', 'new', [good]).id, 101);
assert.throws(() => measurementDeployment('new', 'new', [{ ...good, status: 'in_progress', conclusion: null }]), /No successful/);
assert.throws(() => measurementDeployment('new', 'new', [{ ...good, head_sha: 'old' }]), /No successful/);
assert.throws(() => measurementDeployment('new', 'new', [{ ...good, conclusion: 'failure' }]), /No successful/);
assert.throws(() => measurementDeployment('new', 'new', [{ ...good, head_branch: 'preview' }]), /No successful/);
assert.throws(() => measurementDeployment('old', 'new', [good]), /no longer current/);
console.log('Lighthouse deployment ordering, exact revision and stale-release rejection passed.');
