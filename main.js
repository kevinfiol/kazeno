// import { writeFile } from 'node:fs/promises';

// let styles = new Map();

// let colorScales = ['300', '500', '700'];

// // generate colors
// let colors = {
//   blue: {
//     300: '63b3ed',
//     500: '4299e1',
//     700: '3182ce'
//   }
// };

// for (let color of Object.keys(colors)) {
//   for (let scale of colorScales) {
    
//   }
// }

import { resolve } from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as readline from 'node:readline';

(async () => {
  let css,
      matches,
      usedVars = new Set();

  css = await readFile(resolve('./test.css'), 'utf8');
  matches = css.matchAll(/var\((.+)\)/g);

  for (let match of matches) {
    usedVars.add(match[1]); // store variable names in Set
  }

  // now read library
  let read = createReadStream(resolve('./base.css')),
      output = createWriteStream(resolve('./output.css')),
      rl = readline.createInterface({ input: read, crlfDelay: Infinity });

    rl.on('line', line => {
      let matches, i, hasWritten = false;
      if ((matches = line.match(/--[^;\s]+:\s*[^;\s]+;/g))) {
        for (i = 0; i < matches.length; i++) {
          let varName = matches[i].split(':')[0].trim();
          if (!hasWritten && usedVars.has(varName)) {
            output.write(line + '\n');
            hasWritten = true;
          }
        }
      } else if (line.indexOf('--') > -1) {
        // no op
      } else {
        output.write(line + '\n');
      }
    });

    rl.on('close', _ => {
      output.end();
      console.log('output css has been generated.');
    })
})();