import { spawnSync } from 'node:child_process';
import { assertRelease } from '../src/content/validate.js';
assertRelease();
const result = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, PIKAXU_RELEASE: '1' } });
process.exit(result.status ?? 1);
