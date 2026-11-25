// Starts the app for development and opens it in the browser, like `npm run dev`. First it runs `npm install` when
// package-lock.json changed since the last time, because a copied project brings a new lockfile but not node_modules.
// On Windows, iniciar.bat runs it with a double click.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'packages', 'app');
const marker = join(root, 'node_modules', '.universalis-lock');
const lockHash = () => createHash('sha256').update(readFileSync(join(root, 'package-lock.json'))).digest('hex');

if (!existsSync(marker) || readFileSync(marker, 'utf8') !== lockHash()) {
  console.log('Installing the dependencies of package-lock.json...');
  // --no-save leaves package-lock.json as it is
  const install = spawnSync('npm install --no-save --no-audit --no-fund', { cwd: root, stdio: 'inherit', shell: true });
  if (install.status !== 0) {
    console.error('npm install failed: see the messages above.');
    process.exit(1);
  }
  writeFileSync(marker, lockHash());
}

process.chdir(app);
const { createServer } = await import('vite');
const server = await createServer({ root: app, server: { open: true } });
try {
  await server.listen();
} catch (error) {
  if (!String(error.message).includes('already in use')) throw error;
  console.error(`${error.message}: the app is probably running in another window already.`);
  process.exit(1);
}
server.printUrls();
server.bindCLIShortcuts({ print: true });
