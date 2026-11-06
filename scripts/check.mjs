import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const path = join(root, 'dist/index.html');
const html = await readFile(path, 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs');
assert.match(html, /<html lang="en">/);
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Exactly one page heading');
assert(!/<script\b|\bon\w+\s*=/.test(html), 'No runtime scripts or inline event handlers');
assert(!/\{\{\w+\}\}/.test(html), 'Unresolved template fields');
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const url = match[1];
  if (url.startsWith('#')) assert(ids.includes(url.slice(1)), `Missing anchor: ${url}`);
  else if (!/^(https:|mailto:)/.test(url)) {
    assert(!/^[a-z]+:/i.test(url), `Unexpected URL scheme: ${url}`);
    assert((await stat(resolve(dirname(path), url))).isFile(), `Missing local asset: ${url}`);
  }
}
for (const img of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]*"/.test(img[0]), 'Image missing alt');
for (const input of html.matchAll(/<(?:link|img)\b[^>]*(?:href|src)="(https?:[^\"]+)"/g)) {
  assert.fail(`Unexpected third-party asset request: ${input[1]}`);
}
let previous = 0;
for (const heading of html.matchAll(/<h([1-6])\b/g)) {
  const depth = Number(heading[1]);
  assert(depth <= previous + 1, `Skipped heading level: h${previous} to h${depth}`);
  previous = depth;
}
const luminance = hex => {
  const rgb = hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const contrast = (a,b) => {
  const values = [luminance(a),luminance(b)].sort((a,b) => b-a);
  return (values[0]+.05)/(values[1]+.05);
};
for (const [name,a,b] of [['body','#20272d','#f5f6f7'],['secondary','#55616a','#f5f6f7'],['blue','#2774ae','#f5f6f7'],['hover','#ffffff','#2774ae']]) {
  const value = contrast(a,b);
  assert(value >= 4.5, `${name} text fails AA contrast: ${value.toFixed(2)}:1`);
  console.log(`${name} text contrast ${value.toFixed(2)}:1`);
}
console.log('Static checks passed: local assets, fragments, headings, alt text, no-JS output, and text contrast.');
