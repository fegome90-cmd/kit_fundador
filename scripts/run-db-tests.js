#!/usr/bin/env node
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const jestArgs = ['--runInBand', '--testPathPattern=tests/integration/db', ...args];

const child = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, RUN_DB_TESTS: 'true' }
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
