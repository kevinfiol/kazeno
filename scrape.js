import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

// failed: dark-mode, container, gradient-color-stops

const pages = new Set([
  'accent-color',
  'align-content',
  'align-items',
  'align-self',
  'animation',
  'appearance',
  'aspect-ratio',
  'backdrop-blur',
  'backdrop-brightness',
  'backdrop-contrast',
  'backdrop-grayscale',
  'backdrop-hue-rotate',
  'backdrop-invert',
  'backdrop-opacity',
  'backdrop-saturate',
  'backdrop-sepia',
  'background-attachment',
  'background-blend-mode',
  'background-clip',
  'background-color',
  'background-image',
  'background-origin',
  'background-position',
  'background-repeat',
  'background-size',
  'blur',
  'border-collapse',
  'border-color',
  'border-radius',
  'border-spacing',
  'border-style',
  'border-width',
  'box-decoration-break',
  'box-shadow-color',
  'box-shadow',
  'box-sizing',
  'break-after',
  'break-before',
  'break-inside',
  'brightness',
  'caption-side',
  'caret-color',
  'clear',
  'columns', // 3
  // 'content',
  // 'contrast',
  // 'cursor',
  // 'display',
  // 'divide-color',
  // 'divide-style',
  // 'divide-width',
  // 'drop-shadow',
  // 'drop-shadow',
  // 'fill',
  // 'flex-basis',
  // 'flex-direction',
  // 'flex-grow',
  // 'flex-shrink',
  // 'flex-wrap',
  // 'flex',
  // 'float',
  // 'font-family',
  // 'font-size',
  // 'font-smoothing',
  // 'font-style',
  // 'font-variant-numeric',
  // 'font-weight',
  // 'gap',
  // 'grayscale',
  // 'grid-auto-columns',
  // 'grid-auto-flow',
  // 'grid-auto-rows',
  // 'grid-column',
  // 'grid-row',
  // 'grid-template-columns',
  // 'grid-template-rows',
  // 'height',
  // 'hue-rotate',
  // 'hyphens',
  // 'hyphens',
  // 'invert',
  // 'isolation',
  // 'justify-content',
  // 'justify-items',
  // 'justify-self',
  // 'letter-spacing',
  // 'line-clamp',
  // 'line-height',
  // 'list-style-image',
  // 'list-style-position',
  // 'list-style-type', // 2
  // 'margin',
  // 'max-height',
  // 'max-width',
  // 'min-height',
  // 'min-width',
  // 'mix-blend-mode',
  // 'object-fit',
  // 'object-position',
  // 'opacity',
  // 'order',
  // 'outline-color',
  // 'outline-offset',
  // 'outline-style',
  // 'outline-width',
  // 'overflow',
  // 'overscroll-behavior',
  // 'padding',
  // 'place-content',
  // 'place-items',
  // 'place-self',
  // 'pointer-events',
  // 'position',
  // 'resize',
  // 'ring-color',
  // 'ring-offset-color',
  // 'ring-offset-width',
  // 'ring-width',
  // 'rotate',
  // 'saturate',
  // 'scale',
  // 'screen-readers',
  // 'scroll-behavior',
  // 'scroll-margin',
  // 'scroll-padding',
  // 'scroll-snap-align',
  // 'scroll-snap-stop',
  // 'scroll-snap-type',
  // 'sepia',
  // 'skew',
  // 'space', // 1
  // 'stroke-width',
  // 'stroke',
  // 'table-layout',
  // 'text-align',
  // 'text-color',
  // 'text-decoration-color',
  // 'text-decoration-style',
  // 'text-decoration-thickness',
  // 'text-decoration',
  // 'text-indent',
  // 'text-overflow',
  // 'text-transform',
  // 'text-underline-offset',
  // 'top-right-bottom-left',
  // 'touch-action',
  // 'transform-origin',
  // 'transition-delay',
  // 'transition-duration',
  // 'transition-property',
  // 'transition-timing-function',
  // 'translate',
  // 'typography-plugin',
  // 'user-select',
  // 'vertical-align',
  // 'visibility',
  // 'whitespace',
  // 'width',
  // 'will-change',
  // 'word-break',
  // 'z-index'
]);

const classes = {};

for (let page of pages) {
  let res = await fetch('https://tailwindcss.com/docs/' + page);
  let text = await res.text();

  const { document } = parseHTML(text);
  let [tbody] = document.getElementsByTagName('tbody')
  let children;

  try {
    children = tbody.children;
  } catch (e) {
    console.error(e);
    console.log('failed on page: ', page);
    children = [];
  }

  for (let row of children) {
    try {
      let tds = row.getElementsByTagName('td');
      if (!tds.length) continue;

      let [className, properties] = tds;

      if (className) {
        className = className.childNodes[0];
        if (className === 'Class') continue;

        classes[className] = properties.innerText.trim().replace(/(?:\r\n|\r|\n)/g, '');
      }
    } catch (e) {
      console.error(e);
      console.log('failed on page: ', page);
    }
  }
}

writeFileSync(resolve('./map.json'), JSON.stringify(classes, null, 2));