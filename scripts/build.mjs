import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { marked } from '../vendor/marked.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');
const read = path => readFile(join(root, path), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
// Markdown is trusted repository content. It is never accepted from visitors.
const markdown = text => marked.parse(text, { gfm: true });
const withoutComments = text => text.replace(/<!--[\s\S]*?-->/g, '').trim();
const config = JSON.parse(await read('site.json'));

for (const key of ['title', 'description', 'copyright', 'scholar', 'email']) {
  if (!config[key]) throw new Error(`site.json: missing ${key}`);
}
for (const key of ['scholar', 'faculty', 'x']) {
  if (config[key] && !/^https:\/\//.test(config[key])) throw new Error(`${key} must be an https URL`);
}

function publications(source) {
  const tokens = marked.lexer(source);
  const entries = [];
  let current;
  for (const token of tokens) {
    if (token.type === 'html' && /^<!--/.test(token.raw)) continue;
    if (token.type === 'heading' && token.depth === 3) {
      if (!/^\d{4}$/.test(token.text)) throw new Error('Publication headings must be four-digit years');
      current = { year: token.text, tokens: [] };
      entries.push(current);
    } else if (current) current.tokens.push(token);
    else if (token.type !== 'space') throw new Error('Publications must start with a ### YEAR heading');
  }
  return entries.map(({year, tokens}) => `<article class="publication"><h3>${year}</h3><div class="publication-copy">${marked.parser(tokens)}</div></article>`).join('\n');
}

const support = withoutComments(await read('content/support.md'));
const values = {
  ...Object.fromEntries(Object.entries(config).map(([key, value]) => [key, escape(value)])),
  year: new Date().getUTCFullYear(),
  intro: markdown(await read('content/intro.md')),
  publications: publications(await read('content/publications.md')),
  research: markdown(await read('content/research.md')),
  team: markdown(await read('content/team.md')),
  support: support ? `<aside class="support" aria-label="Research support"><h3>Research support</h3>${markdown(support)}</aside>` : '',
  x: config.x ? `<a href="${escape(config.x)}">X <span aria-hidden="true">↗</span></a>` : '',
};
let html = (await read('template.html')).replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown template field: ${key}`);
  return values[key];
});
// Conservative minification: preserve all text whitespace, pre/code, and inline boundaries.
html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n[\t ]+/g, '\n').replace(/\n{2,}/g, '\n').trim();
const css = (await read('assets/style.css')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,:])\s*/g, '$1').trim();
await mkdir(out, { recursive: true });
// Keep the output directory itself intact: static preview servers may use it as cwd.
await rm(join(out, 'assets'), { recursive: true, force: true });
await cp(join(root, 'assets'), join(out, 'assets'), { recursive: true });
await writeFile(join(out, 'assets/style.css'), css);
await writeFile(join(out, 'index.html'), html + '\n');
await writeFile(join(out, '.nojekyll'), '');
console.log(`Built dist/index.html (${Buffer.byteLength(html)} bytes), CSS (${Buffer.byteLength(css)} bytes). No client JavaScript.`);
