/**
 * @meshtastic/protobufs lists "types": "./dist/mod.d.ts" but only ships mod-*.d.ts.
 * Copy the hashed filename to mod.d.ts so TypeScript and IDEs resolve imports.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(
  root,
  'node_modules',
  '@meshtastic',
  'protobufs',
  'dist'
);
const target = path.join(dist, 'mod.d.ts');

if (!fs.existsSync(dist)) {
  process.exit(0);
}

const hashed = fs
  .readdirSync(dist)
  .filter((f) => f.startsWith('mod-') && f.endsWith('.d.ts'));
if (!hashed.length) {
  process.exit(0);
}
fs.copyFileSync(path.join(dist, hashed[0]), target);
