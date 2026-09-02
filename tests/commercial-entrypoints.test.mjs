import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('commercial route constants use only canonical HTTPS surfaces', async () => {
  const source = await read('src/data/commercialRoutes.ts');
  for (const url of [
    'https://org.elenkos.systems/quotes/request',
    'https://org.elenkos.systems/register-interest',
    'https://user.elenkos.systems/register-interest',
    'https://api.elenkos.systems',
  ]) {
    assert.match(source, new RegExp(url.replaceAll('.', '\\.')));
  }
  assert.doesNotMatch(source, /http:\/\//);
  assert.match(source, /activationState: 'prelaunch'/);
});

test('static entrypoints contain no form, script, analytics implementation, or payment activation', async () => {
  const files = await Promise.all([
    read('src/pages/quote.astro'),
    read('src/pages/register-interest.astro'),
    read('src/layouts/BaseLayout.astro'),
  ]);
  const joined = files.join('\n');
  assert.doesNotMatch(joined, /<form\b/i);
  assert.doesNotMatch(joined, /<script\b/i);
  assert.doesNotMatch(
    joined,
    /google-analytics|googletagmanager|segment\.com|cdn\.segment|mixpanel(?:\.com|\.init)|posthog|plausible\.io|analytics\.js/i,
  );
  assert.doesNotMatch(joined, /checkout|card number|bank account|cash out/i);
  assert.match(joined, /non-binding estimate/i);
  assert.match(joined, /creates no account/i);
  assert.match(joined, /does not collect or transmit personal information/i);
});

test('CSP preserves a disconnected, non-submitting static origin', async () => {
  const layout = await read('src/layouts/BaseLayout.astro');
  for (const directive of [
    "connect-src 'none'",
    "form-action 'none'",
    "script-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
  ]) {
    assert.ok(layout.includes(directive), `missing CSP directive: ${directive}`);
  }
});

test('well-known manifest stays prelaunch and non-activating', async () => {
  const manifest = JSON.parse(await read('public/.well-known/commercial-routes.json'));
  assert.deepEqual(Object.keys(manifest).sort(), [
    'activationState',
    'marketingSiteCollectsPersonalData',
    'mutationApi',
    'preInterest',
    'quote',
    'requiredGates',
    'schemaVersion',
  ]);
  assert.equal(manifest.activationState, 'prelaunch');
  assert.equal(manifest.marketingSiteCollectsPersonalData, false);
  assert.equal(manifest.quote.nonBinding, true);
  assert.equal(manifest.quote.createsFinancialObligation, false);
  assert.equal(manifest.preInterest.createsAccount, false);
  assert.equal(manifest.preInterest.createsEnrollment, false);
  assert.ok(manifest.requiredGates.length >= 5);
});
