import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (name) => readFile(new URL('../' + name, import.meta.url), 'utf8');
const escapeRegex = (value) => value.replace(/[^a-zA-Z0-9]/g, '\\$&');

function assertToolchainContract(pkg, lock, ci, pages) {
  assert.equal(pkg.packageManager, 'pnpm@11.22.0', 'pin the dependency resolver');
  assert.equal(pkg.scripts.validate, 'pnpm check && pnpm test && pnpm build',
    'CI must execute source analysis, tests and production build');
  assert.equal(pkg.scripts.check, 'astro check', 'do not bypass Astro diagnostics');

  const pinned = {
    '@astrojs/check': '0.9.10',
    '@astrojs/sitemap': '3.7.4',
    astro: '7.3.2',
    typescript: '6.0.3',
  };
  assert.match(lock, /^lockfileVersion: '9\.0'$/m);
  const endImporter = lock.indexOf('\npackages:\n');
  assert.ok(endImporter > 0, 'required pnpm package/graph section');
  const importer = lock.slice(0, endImporter);
  for (const [name, version] of Object.entries(pinned)) {
    assert.equal(pkg.devDependencies[name], version, name + ': exact approved manifest pin');
    const entry = new RegExp(
      '^      ' + escapeRegex(name.startsWith('@') ? "'" + name + "'" : name) +
      ':\\n        specifier: ' + escapeRegex(version) +
      '\\n        version: ' + escapeRegex(version) + '(?:\\(|$)', 'm',
    );
    assert.match(importer, entry, name + ': frozen lock importer must match manifest');
  }

  assert.match(lock, /^  typescript@6\.0\.3:\n    resolution: \{integrity: sha512-[a-zA-Z0-9+/=]+\}$/m,
    'TypeScript has registry integrity provenance');
  assert.match(lock, /^  typescript@6\.0\.3: \{\}$/m,
    'TypeScript 6 snapshot is present and has no native-platform optional dependencies');
  for (const dep of [
    '@astrojs/check', '@astrojs/language-server',
    '@volar/kit', '@volar/language-server',
    '@volar/language-service', '@volar/typescript',
  ]) {
    assert.match(lock,
      new RegExp("^  '" + escapeRegex(dep) + "@[^\\n]*typescript@6\\.0\\.3", 'm'),
      dep + ': peer graph must select the reviewed TypeScript ABI');
  }
  assert.doesNotMatch(lock, /typescript@7\.0\.2|typescript: 7\.0\.2/,
    'reject TypeScript 7 in peer dependencies and snapshots');
  assert.doesNotMatch(lock, /@typescript\/typescript-/,
    'reject TypeScript 7 platform-native packages in the TS6 lock');
  for (const [label, workflow] of [['CI', ci], ['Pages', pages]]) {
    assert.match(workflow, /pnpm install --frozen-lockfile --ignore-scripts/,
      label + ': no opportunistic dependency resolution or install scripts');
    assert.match(workflow, /persist-credentials: false/,
      label + ': checkout must not retain write credentials');
    assert.match(workflow, /pnpm validate/,
      label + ': validate every source and generated artifact before use');
  }
  assert.ok(ci.includes('github.event.pull_request.head.sha || github.sha'),
    'CI must execute the reviewed exact PR head');
  assert.ok(ci.includes('git rev-parse HEAD'),
    'CI must prove its checkout equals the expected head');
}

test('manifest and pnpm v9 graph pin a compatible TypeScript 6 and Astro toolchain', async () => {
  const [pkg, lock, ci, pages] = await Promise.all([
    read('package.json').then(JSON.parse),
    read('pnpm-lock.yaml'),
    read('.github/workflows/ci.yml'),
    read('.github/workflows/pages.yml'),
  ]);
  assertToolchainContract(pkg, lock, ci, pages);
});

test('negative admission: manifest drift, stale lock, native TS7 and workflow bypass all fail', async () => {
  const [pkg, lock, ci, pages] = await Promise.all([
    read('package.json').then(JSON.parse),
    read('pnpm-lock.yaml'),
    read('.github/workflows/ci.yml'),
    read('.github/workflows/pages.yml'),
  ]);
  const check = (manifest = pkg, graph = lock, ciText = ci, pagesText = pages) =>
    assertToolchainContract(manifest, graph, ciText, pagesText);
  assert.throws(() => check({
    ...pkg,
    devDependencies: { ...pkg.devDependencies, typescript: '7.0.2' },
  }), /typescript: exact approved manifest pin/);
  assert.throws(() => check(pkg, lock.replace('specifier: 6.0.3', 'specifier: 7.0.2')),
    /frozen lock importer must match manifest/);
  assert.throws(() => check(pkg, lock.replace(
    'typescript@6.0.3', 'typescript@7.0.2')),
    /reject TypeScript 7/);
  assert.throws(() => check(pkg, lock + "\n  '@typescript/typescript-linux-x64@7.0.2':\n    optional: true\n"),
    /reject TypeScript 7/);
  assert.throws(() => check(pkg, lock, ci.replace('--frozen-lockfile --ignore-scripts', '')),
    /no opportunistic dependency resolution/);
  assert.throws(() => check(pkg, lock, ci.replace('persist-credentials: false', 'persist-credentials: true')),
    /checkout must not retain write credentials/);
  assert.throws(() => check(pkg, lock, ci, pages.replace('pnpm validate', 'pnpm build')),
    /validate every source/);
});
