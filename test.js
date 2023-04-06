import { build } from './index.js';

await build({
  path: './test',
  ext: /\.(js|jsx|ts|tsx)$/,
  output: './output.css'
});