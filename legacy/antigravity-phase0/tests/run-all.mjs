// Master Automated Test Runner for Hermes Connect Next

import { runCoreTests } from './core.test.mjs';
import { runTrainerTests } from './trainer.test.mjs';
import { runAITests } from './ai.test.mjs';
import fs from 'node:fs';

async function main() {
  console.log('====================================================');
  console.log('🚀 HERMES CONNECT NEXT — AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  const startTime = Date.now();
  let totalSuites = 3;
  let passedSuites = 0;

  try {
    await runCoreTests();
    passedSuites++;

    await runTrainerTests();
    passedSuites++;

    await runAITests();
    passedSuites++;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('====================================================');
    console.log(`🎉 ALL ${passedSuites}/${totalSuites} TEST SUITES PASSED IN ${duration}s!`);
    console.log('====================================================');

    // Generate TEST_REPORT.md
    const reportContent = `# Hermes Connect Next — Test Execution Report

**Date**: ${new Date().toISOString()}  
**Status**: 100% PASSED (ALL SUITES GREEN)  
**Execution Duration**: ${duration}s

---

## Summary Results

| Test Suite | Result | Details |
|---|---|---|
| **Core Domain & State Engine** | ✅ PASSED | Workspace, Roles, State Mutations & Task completion |
| **Trainer & Fitness Vertical** | ✅ PASSED | Client Roster, Overdue Check-in Review, Exercise Library |
| **Multi-Agent AI & Safety** | ✅ PASSED | AI Router, Trainer Copilot, Science Agent & Safety Guardrails |

---

## Detailed Suite Output

- \`tests/core.test.mjs\`: Workspace ID verified (\`ws_hermes_fit_01\`), Auth RBAC rules enforced, Task status toggle verified.
- \`tests/trainer.test.mjs\`: At-risk client detection (\`David Chen\`), Check-in review feedback persisted, Exercise library integrity verified.
- \`tests/ai.test.mjs\`: Trainer Copilot check-in summary draft generated, Science Agent evidence tags (\`FACT\` / \`EVIDENCE\`) returned, Medical diagnosis prompt blocked by safety guardrail.
`;

    fs.writeFileSync('./TEST_REPORT.md', reportContent);
    console.log('📄 Updated TEST_REPORT.md successfully.');

  } catch (err) {
    console.error('❌ TEST FAILURE DETECTED:', err);
    process.exit(1);
  }
}

main();
