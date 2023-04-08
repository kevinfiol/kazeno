const { resolve, join } = require('node:path');
const { readFileSync } = require('node:fs');
const { readFile, opendir, writeFile } = require('node:fs/promises');

let classes = JSON.parse(readFileSync('./classes.json', 'utf8'));

// https://tailwindcss.com/docs/hover-focus-and-other-states
let mods = {
  hover: 1,
  focus: 1,
  active: 1,
  visited: 1,
  target: 1,
  first: 1,
  last: 1,
  only: 1,
  odd: 1,
  even: 1,
  empty: 1,
  disabled: 1,
  enabled: 1,
  checked: 1,
  indeterminate: 1,
  default: 1,
  required: 1,
  valid: 1,
  invalid: 1,
  autofill: 1,
  'focus-within': 1,
  'focus-visible': 1,
  'first-of-type': 1,
  'last-of-type': 1,
  'only-of-type': 1,
  'in-range': 1,
  'out-of-range': 1,
  'placeholder-shown': 1,
  'read-only': 1,
  sm: '@media (min-width: 640px) {',
  md: '@media (min-width: 768px) {',
  lg: '@media (min-width: 1024px) {',
  xl: '@media (min-width: 1280px) {',
  '2xl': '@media (min-width: 1536px) {',
  dark: '@media (prefers-color-scheme: dark) {',
  'max-sm': '@media not all and (min-width: 640px) {',
  'max-md': '@media not all and (min-width: 768px) {',
  'max-lg': '@media not all and (min-width: 1024px) {',
  'max-xl': '@media not all and (min-width: 1280px) {',
  'max-2xl': '@media not all and (min-width: 1536px) {',
  'portrait': '@media (orientation: portrait) {',
  'landscape': '@media (orientation: landscape) {',
  'motion-safe': '@media (prefers-reduced-motion: no-preference) {',
  'motion-reduce': '@media (prefers-reduced-motion: reduce) {',
  'contrast-more': '@media (prefers-contrast: more) {',
  'contrast-less': '@media (prefers-contrast: less) {',
  'print': '@media print {'
};

module.exports.build = build;async function build({ path = '.', ext = /\.(js|jsx|ts|tsx)$/, output = 'app.css', preflight = true } = {}) {
  let filePath = resolve(path),
    outfile = resolve(output),
    written = {},
    css = '',
    mediaCss = '';

  console.time('build');
  if (preflight) css += await readFile(resolve('./preflight.css'), 'utf8');

  for (let filename of await walk(filePath))
    if (ext.test(filename)) {
      let [_css, _mediaCss] = await processFile(filename, written);
      css += _css;
      mediaCss += _mediaCss;
    }

  css += mediaCss;
  await writeFile(outfile, css, 'utf8');
  console.timeEnd('build');
}

module.exports.processFile = processFile;async function processFile(filename = '', written = {}) {
  let contents = await readFile(filename, 'utf8'),
    matches = contents.matchAll(/'(.*?)'|"([^"]*)"/g),
    css = '',
    mediaCss = '';

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
        for (let mod of tmp) {
          let val = mods[mod];
          if (!val) continue;

          if (typeof val === 'string') {
            let modCls = `${mod}\\:${cls}`;
            if (written[modCls]) continue;
            written[modCls] = 1;

            let chunks = mediaCss.split(val);
            if (chunks.length > 1) {
              mediaCss = chunks[0]
                + val
                + `\n  .${modCls} { ${rule} }`
                + chunks[1];
            } else {
              mediaCss += val  // add media query
                + `\n  .${modCls} { ${rule} }`
                + '\n}\n'; // close query
            }
          } else {
            let modCls = `${mod}\\:${cls}:${mod}`;
            if (written[modCls]) continue;
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

  return [css, mediaCss];
}

async function walk(dir, files = []) {
  for await (let dirent of await opendir(dir)) {
    let file = join(dir, dirent.name);
    if (dirent.isDirectory()) files.concat(await walk(file, files));
    else if (dirent.isFile()) files.push(file);
  }

  return files;
}