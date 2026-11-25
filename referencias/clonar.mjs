// Clones the reference repositories into referencias/ (git-ignored) and records their commits in versiones.json.
// Usage: node referencias/clonar.mjs [name...]   (needs git in PATH; about 600 MB in all; names filter, e.g. valkyrie-store)
// Content packs are not cloned: their repositories only hold the zip, its .ini and an icon. Get them with descargar-escenarios.mjs.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// commit: pinned version; without it, the latest commit of the default branch.
const repos = [
  { dir: 'valkyrie', url: 'https://github.com/NPBruce/valkyrie.git', commit: '752d4206738f00a6d41e34be56fe7e65e7b35965' },
  { dir: 'valkyrie-store', url: 'https://github.com/NPBruce/valkyrie-store.git' },
  { dir: 'valkyrie-questdata', url: 'https://github.com/NPBruce/valkyrie-questdata.git' },
  { dir: 'valkyrie.wiki', url: 'https://github.com/NPBruce/valkyrie.wiki.git' },
  { dir: 'ValkyrieMCP', url: 'https://github.com/thijs-hakkenberg/ValkyrieMCP.git', commit: 'b1a89928f74edf8f84f89d53e4ce518babfa5142' },
];

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();

try {
  git(['--version'], here);
} catch {
  console.error('git is not installed or not in PATH. Install Git (https://git-scm.com) and try again.');
  process.exit(1);
}

const only = process.argv.slice(2).map((name) => name.replaceAll('\\', '/'));
const versionsPath = join(here, 'versiones.json');
const versions = existsSync(versionsPath) ? JSON.parse(readFileSync(versionsPath, 'utf8')) : {};
let failed = 0;
for (const repo of repos.filter((r) => !only.length || only.some((name) => r.dir.includes(name)))) {
  const path = join(here, repo.dir);
  try {
    if (!existsSync(join(path, '.git'))) {
      mkdirSync(path, { recursive: true });
      git(['init', '-q'], path);
      git(['remote', 'add', 'origin', repo.url], path);
    }
    git(['remote', 'set-url', 'origin', repo.url], path);
    // Keep the exact bytes on every OS: line endings are part of what the battery tests.
    git(['config', 'core.autocrlf', 'false'], path);
    console.log(`${repo.dir}: ${repo.commit ? `fetching ${repo.commit.slice(0, 7)}` : 'fetching latest'}`);
    git(['fetch', '-q', '--depth', '1', 'origin', repo.commit ?? 'HEAD'], path);
    git(['checkout', '-q', '--detach', 'FETCH_HEAD'], path);
    versions[repo.dir] = { url: repo.url, commit: git(['rev-parse', 'HEAD'], path), date: git(['log', '-1', '--format=%cI'], path) };
  } catch (error) {
    failed++;
    console.error(`${repo.dir}: failed (${error.message.split('\n')[0]})`);
  }
}

writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + '\n');
console.log(`Done: ${Object.keys(versions).length} repositories recorded, ${failed} failed. Commits in referencias/versiones.json`);
process.exitCode = failed ? 1 : 0;
