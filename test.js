import { build } from './index.js';

await build({
  path: './test',
  // ext: /\.(js|jsx|ts|tsx|html)$/,
  ext: /\.(jsx)$/,
  output: './test/output.css',
  preflight: true
});