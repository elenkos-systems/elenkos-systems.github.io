import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), 'utf8');

test('Astro owns every public route', async () => {
  const routes = [
    'src/pages/index.astro',
    'src/pages/model.astro',
    'src/pages/safeguards.astro',
    'src/pages/for-engineers.astro',
    'src/pages/for-teams.astro',
    'src/pages/404.astro',
  ];
  for (const route of routes) {
    assert.ok((await read(route)).length > 100, `${route} must be substantive`);
  }
});

test('business model preserves independent blind review', async () => {
  const model = await read('src/pages/model.astro');
  assert.match(model, /AI assessment.*sealed/is);
  assert.match(model, /randomly assigned/is);
  assert.match(model, /both.*reporter.*reviewer.*credits/is);
  assert.match(model, /additional human review/is);
  assert.doesNotMatch(model, /guaranteed commission|guaranteed payout/i);
});

test('GitHub Actions use immutable references and least privilege', async () => {
  const ci = await read('.github/workflows/ci.yml');
  const pages = await read('.github/workflows/pages.yml');
  for (const workflow of [ci, pages]) {
    const uses = [...workflow.matchAll(/^\s*uses:\s*(\S+)/gm)].map((match) => match[1]);
    assert.ok(uses.length > 0);
    for (const action of uses) {
      if (action.startsWith('docker://')) assert.match(action, /@sha256:[0-9a-f]{64}$/);
      else assert.match(action, /@[0-9a-f]{40}$/);
    }
    assert.match(workflow, /persist-credentials:\s*false/);
  }
  assert.doesNotMatch(ci, /pages:\s*write|id-token:\s*write/);
  assert.match(pages, /^permissions:\n  contents: read$/m);
  assert.match(pages, /\n    permissions:\n      pages: write\n      id-token: write/);
});

test('Zed graph is frozen and installer verifies a fixed digest', async () => {
  assert.equal((await read('.zpkg.lock')).trim(), 'version = 1');
  const manifest = await read('.zpkg.toml');
  assert.match(manifest, /\[targets\.site\]/);
  assert.match(manifest, /adapter = "node"/);
  const installer = await read('scripts/install-zed-ci.sh');
  assert.match(installer, /sha256sum --check --strict/);
  assert.match(installer, /--proto '=https' --tlsv1\.2/);
});

test('site build stays Astro-only and credential-free', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.devDependencies.astro, '7.2.4');
  assert.equal(pkg.packageManager, 'pnpm@11.22.0');
  const workflows = `${await read('.github/workflows/ci.yml')}\n${await read('.github/workflows/pages.yml')}`;
  assert.doesNotMatch(workflows, /flutter build|jekyll|hugo/i);
  assert.doesNotMatch(workflows, /gh[pousr]_[A-Za-z0-9]{20,}|lin_api_[A-Za-z0-9]{20,}/);
});
