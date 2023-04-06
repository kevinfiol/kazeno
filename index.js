import { resolve, join } from 'node:path';
import { readFile, opendir, writeFile } from 'node:fs/promises';
import classes from './classes.js';

let written = {};

export async function build({ path = '.', ext = /\.(js|jsx|ts|tsx)$/, output = 'app.css' } = {}) {
  let filePath = resolve(path),
    outfile = resolve(output),
    css = '';

  for (let filename of await walk(filePath)) {
    if (ext.test(filename)) {
      let contents = await readFile(filename, 'utf8');
      let matches = contents.matchAll(/'(.*?)'|"([^"]*)"/g);

      for (let match of matches) {
        match = match[1] ?? match[2];
        if (!match) continue;

        let rule, tokens = match.split(' ').map(t => t.trim()).filter(t => !!t);
        for (let token of tokens) {
          if ((rule = classes[token]) && !written[token]) {
            written[token] = 1;
            css += `.${token.replaceAll('/', '\\/')} { ${rule} }\n`;
          }
        }
      }
    }
  }

  await writeFile(outfile, css, 'utf8');
}

async function walk(dir, files = []) {
  for await (let dirent of await opendir(dir)) {
    let file = join(dir, dirent.name);
    if (dirent.isDirectory()) files.concat(await walk(file, files));
    else if (dirent.isFile()) files.push(file);
  }

  return files;
}