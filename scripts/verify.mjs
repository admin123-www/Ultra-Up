import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const htmlPath = new URL('../public/index.html', import.meta.url);
const html = await readFile(htmlPath, 'utf8');

const required = [
  '<!DOCTYPE html>',
  "document.createElement('canvas')",
  '<script>',
  '</script>',
  '</html>'
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`public/index.html is missing required marker: ${marker}`);
  }
}

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
  throw new Error('The inline game script could not be found.');
}

new vm.Script(scriptMatch[1], { filename: 'public/index.html:inline-script' });
console.log('Verified: public/index.html and the inline game script are valid.');
