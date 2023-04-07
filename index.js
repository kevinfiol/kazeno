import { resolve, join } from 'node:path';
import { readFile, opendir, writeFile } from 'node:fs/promises';
import classes from './classes.js';

const pseudo = {
  hover: 1,
  active: 1,
  focus: 1
};

export async function build({ path = '.', ext = /\.(js|jsx|ts|tsx)$/, output = 'app.css' } = {}) {
  let filePath = resolve(path),
    outfile = resolve(output),
    written = {},
    css = '';

  for (let filename of await walk(filePath)) {
    if (ext.test(filename)) {
      css += await processFile(filename, written);
    }
  }

  await writeFile(outfile, css, 'utf8');
}

export async function processFile(filename = '', written = {}) {
  let contents = await readFile(filename, 'utf8'),
    matches = contents.matchAll(/'(.*?)'|"([^"]*)"/g),
    css = '';

  for (let match of matches) {
    match = match[1] || match[2];
    if (!match) continue;

    let tokens = match.split(' ').map(t => t.trim()).filter(t => !!t);
    for (let token of tokens) {
      let rule,
        cls = token,
        hasMods = 0,
        tmp = token.split(':');

      if (tmp.length > 1) {
        cls = tmp.pop();
        hasMods = 1;
      }

      rule = classes[cls];
      if (!rule) continue;

      if (hasMods) {
        for (let modifier of tmp) {
          if (!pseudo[modifier]) continue;
          let modCls = `${modifier}\\:${cls}:${modifier}`;

          if (!written[modCls]) {
            written[modCls] = 1;
            css += `.${modCls.replaceAll('/', '\\/')} { ${rule} }\n`;
          }
        }
      } else if (!written[cls]) {
        written[cls] = 1;
        css += `.${cls.replaceAll('/', '\\/')} { ${rule} }\n`;
      }
    }
  }

  return css;
}

async function walk(dir, files = []) {
  for await (let dirent of await opendir(dir)) {
    let file = join(dir, dirent.name);
    if (dirent.isDirectory()) files.concat(await walk(file, files));
    else if (dirent.isFile()) files.push(file);
  }

  return files;
}