# taildude

> What if we just take Tailwind CSS defaults and stick them into a giant hash map?

You would get this.

* The majority of Tailwind CSS defaults
* Support for most pseudo-class variants and media query modifiers
* A "JIT compiler". No I'm no Mike Pall; it's a script that scans your source files and builds a string. But this is the terminology the Tailwind guys use, and it makes me sound smarter than I am.

## Usage

```shell
npm install tailguy --save-dev
```

1. Write a build script
```js
// build.js
import { build } from 'tailguy';

await build({
  // path containing your source files
  path: './src',
  // file extensions to scan
  ext: /\.(js|jsx|ts|tsx)$/,
  // where to save the css containing all of your classes
  output: './app.css',
  // include tailwind normalization CSS
  preflight: true
})
```

2. Use some Tailwind CSS classes
```jsx
// src/App.jsx
import { h } from 'preact';

const App = () => (
  <p className="font-serif bg-gray-300 hover:font-mono hover:bg-blue-300">
    hello
  </p>
);
```

3. Run your build script
```shell
node build.js
```

4. Your CSS will contain only the classes you need (+ preflight CSS if enabled)
```css
/* app.css */
.font-serif { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
.bg-gray-300 { background-color: rgb(209 213 219); }
.hover\:font-mono:hover { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.hover\:bg-blue-300:hover { background-color: rgb(147 197 253); }
```

## But why?

Years ago, I was a user and proponent of [basscss](https://basscss.com/), a tiny CSS library that arguably sparked this whole atomic CSS craze (along with Tachyons). It was small, focused, and immensely useful when paired with a UI library like Mithril or React. Tailwind soon entered the scene, and became the de-facto atomic CSS library through dev power and lots and lots of marketing. [WindiCSS](https://windicss.org/) innovated on the ideas of Tailwind and introduced the original "JIT" solution, speeding up dev and build times with its incremental approach. Tailwind soon followed after with their own JIT solution, and the minds behind Windi soon went on to create [UnoCSS](https://github.com/unocss/unocss).

Despite all this churn, I miss the simplicity and opinionated nature of Basscss which clocked in around 2kb *without* any build steps or purging (meanwhile, a Tailwind local install is 9MB and ropes in ~70 or so dependencies). The JIT approach seems like a nice and sensible alternative to purging, so I wanted to see what could be done with a weekend's worth of effort. If anything, the next iteration of this will look more like Basscss since I prefer their class naming scheme to Tailwind's.

## Should I use this?
For your job? Probably not. For your toy project? Go for it, and let me know what you'd like to see or what's missing.

## Inspiration
[TailwindCSS](https://tailwindcss.com/) and [WindiCSS](https://windicss.org/).