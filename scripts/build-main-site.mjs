import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const normalize = text => text.trim().replace(/\s+/g, ' ');
export function translateMain(html, catalog) {
  const missing = new Set();
  function translate(value) {
    if (!/[\u0400-\u04ff]/.test(value)) return value;
    const key = normalize(value);
    if (!(key in catalog)) { missing.add(key); return value; }
    return value.replace(value.trim(), catalog[key]);
  }
  let english = html.replace(/<!--[\s\S]*?-->|<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>|<[^>]+>|[^<]+/g, token => {
    if (token.startsWith('<!--') || /^<(?:script|style)\b/.test(token)) return token;
    if (token.startsWith('<')) return token.replace(/\b(aria-label|title|content)="([^"]*)"/g, (_, name, value) => name + '="' + translate(value) + '"');
    return translate(token);
  });
  if (missing.size) throw new Error('Missing main-site translations:\n' + [...missing].map(t => JSON.stringify(t) + ': "",').join('\n'));
  english = english.replace('<html lang="ru">', '<html lang="en">').replace('href="index.en.html" lang="en" data-language-link>ENG', 'href="index.html" lang="ru" data-language-link>RU');
  return english;
}
export async function assembleMain() {
  const html = await readFile(join(root, 'Z-Aura-GitHub', 'index.html'), 'utf8');
  const catalog = JSON.parse(await readFile(join(root, 'website', 'main.en.json'), 'utf8'));
  return { 'index.html': html, 'index.en.html': translateMain(html, catalog), 'assets/preferences.js': await readFile(join(root, 'website', 'shared', 'preferences.js'), 'utf8') };
}
async function main() {
  const files = await assembleMain();
  for (const [name, contents] of Object.entries(files)) {
    if (name === 'index.html') continue;
    const path = join(root, 'Z-Aura-GitHub', name); await mkdir(resolve(path, '..'), { recursive: true }); await writeFile(path, contents, 'utf8');
  }
  console.log('Main site RU/ENG + theme assets built locally; not deployed.');
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main().catch(error => { console.error(error.message); process.exitCode = 1; });
