import { pathToFileURL } from 'node:url';

export function measurementDeployment(expectedSha, mainSha, runs) {
  if (!expectedSha || expectedSha !== mainSha) throw new Error('Measurement revision is no longer current main. Do not label current production with an older SHA.');
  const release = runs.find(run => run.head_sha === expectedSha && run.head_branch === 'main'
    && run.status === 'completed' && run.conclusion === 'success');
  if (!release) throw new Error('No successful exact-revision deployment receipt. Lighthouse must not race production deployment.');
  return release;
}

async function verify() {
  const repo = process.env.GITHUB_REPOSITORY;
  const expectedSha = process.env.EXPECTED_SHA;
  const token = process.env.GH_TOKEN;
  if (!repo || !expectedSha || !token) throw new Error('Missing read-only GitHub measurement context.');
  const get = async path => {
    const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) throw new Error(`Deployment evidence read failed: HTTP ${response.status}`);
    return response.json();
  };
  const [main, history] = await Promise.all([
    get('git/ref/heads/main'),
    get(`actions/workflows/cloudflare-pages-production-v2.yml/runs?head_sha=${expectedSha}&per_page=20`),
  ]);
  const release = measurementDeployment(expectedSha, main.object?.sha, history.workflow_runs || []);
  console.log(`Measurement deployment verified: ${expectedSha}; release run ${release.id}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verify().catch(error => { console.error(error.message); process.exitCode = 1; });
}
