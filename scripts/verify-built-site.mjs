import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const requiredFiles = [
  'index.html',
  'model/index.html',
  'safeguards/index.html',
  'for-engineers/index.html',
  'for-teams/index.html',
  '404.html',
  'robots.txt',
  '.well-known/security.txt',
  'sitemap-index.xml',
  'og.png',
];

for (const relative of requiredFiles) {
  const target = new URL(relative, dist);
  const info = await stat(target);
  if (!info.isFile() || info.size === 0) {
    throw new Error(`Missing or empty production artifact: ${relative}`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const files = await walk(fileURLToPath(dist));
const sourceMap = files.find((file) => file.endsWith('.map'));
if (sourceMap) throw new Error(`Source map must not be published: ${sourceMap}`);

const secretShape = /(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|lin_api_[A-Za-z0-9]{20,}|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY)/;
const htmlFiles = files.filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (secretShape.test(html)) throw new Error(`Credential-shaped content in ${file}`);
  if (/\b(?:href|src)=["']http:\/\//i.test(html)) throw new Error(`Insecure asset or link in ${file}`);
  if (!html.includes('http-equiv="Content-Security-Policy"')) throw new Error(`Missing CSP in ${file}`);
  if (!html.includes('rel="canonical"')) throw new Error(`Missing canonical URL in ${file}`);
  if (!html.includes('name="description"')) throw new Error(`Missing description in ${file}`);
  if (/<script\b/i.test(html)) throw new Error(`Unexpected executable script in static page ${file}`);
  if (/TODO|lorem ipsum|example\.com/i.test(html)) throw new Error(`Placeholder content in ${file}`);
}

const home = await readFile(new URL('index.html', dist), 'utf8');
for (const claim of [
  'Find the failures that matter.',
  'Independent by design',
  'Agreement earns credits',
  'Disagreement gets more scrutiny',
]) {
  if (!home.includes(claim)) throw new Error(`Homepage is missing required claim: ${claim}`);
}

console.log(`Certified ${htmlFiles.length} static HTML pages and ${files.length} total artifacts.`);
