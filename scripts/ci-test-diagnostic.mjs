import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const commands = String(packageJson.scripts?.test || '')
  .split(/\s+&&\s+/)
  .map((value) => value.trim())
  .filter(Boolean);

const report = {
  generated_at: new Date().toISOString(),
  total_commands: commands.length,
  passed: [],
  failed: null,
};

for (let index = 0; index < commands.length; index += 1) {
  const command = commands[index];
  console.log(`\n[diagnostic ${index + 1}/${commands.length}] ${command}`);
  const result = spawnSync(command, {
    cwd: process.cwd(),
    shell: true,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 8 * 1024 * 1024,
  });
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  process.stdout.write(stdout);
  process.stderr.write(stderr);
  if (result.status !== 0) {
    report.failed = {
      index: index + 1,
      command,
      exit_code: result.status,
      signal: result.signal || null,
      stdout: stdout.slice(-20000),
      stderr: stderr.slice(-20000),
    };
    break;
  }
  report.passed.push({ index: index + 1, command });
}

await writeFile('hr-ci-diagnostic.json', JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
