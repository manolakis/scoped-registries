import { expect } from '@open-wc/testing';
import { cssTransform } from '../src/cssTransform.js';

import '../index.js'; // loads the polyfill

// https://css4-selectors.com/selectors/

const createTestData = (...items) =>
  items
    .map(([name, result]) => [
      [`.${name}`, `\\.${name}`],
      [`.${name}.${name}`, `\\.${name}\\.${name}`],
      [`#${name}`, `#${name}`],
      ['*', '\\*'],
      [`${name}`, `${result}`],
      [`${name}.${name}`, `${result}\\.${name}`],
      [`${name},${name}`, `${result},${result}`],
      [`${name} ${name}`, `${result} ${result}`],
      [`${name}>${name}`, `${result}>${result}`],
      [`${name}+${name}`, `${result}\\+${result}`],
      [`${name}~${name}`, `${result}~${result}`],
      [`${name}[${name}]`, `${result}\\[${name}\\]`],
      [`${name}[${name}="${name}"]`, `${result}\\[${name}="${name}"\\]`],
      [`${name}[${name}~="${name}"]`, `${result}\\[${name}~="${name}"]`],
      [`${name}[${name}|="${name}"]`, `${result}\\[${name}\\|="${name}"\\]`],
      [`${name}[${name}^="${name}"]`, `${result}\\[${name}\\^="${name}"\\]`],
      [`${name}[${name}$="${name}"]`, `${result}\\[${name}\\$="${name}"\\]`],
      [`${name}[${name}*="${name}"]`, `${result}\\[${name}\\*="${name}"\\]`],
      [
        `${name}[${name}*="${name}" i]`,
        `${result}\\[${name}\\*="${name}" i\\]`,
      ],
      [
        `${name}[${name}*="${name}" s]`,
        `${result}\\[${name}\\*="${name}" s\\]`,
      ],
      [`${name}:active`, `${result}:active`],
      [`${name}::after`, `${result}::after`],
      [`${name}::before`, `${result}::before`],
      [`${name}:checked`, `${result}:checked`],
      [`${name}:default`, `${result}:default`],
      [`${name}:disabled`, `${result}:disabled`],
      [`${name}:empty`, `${result}:empty`],
      [`${name}:enabled`, `${result}:enabled`],
      [`${name}:first-child`, `${result}:first-child`],
      [`${name}::first-letter`, `${result}::first-letter`],
      [`${name}::first-line`, `${result}::first-line`],
      [`${name}:first-of-type`, `${result}:first-of-type`],
      [`${name}:focus`, `${result}:focus`],
      [`${name}:hover`, `${result}:hover`],
      [`${name}:in-range`, `${result}:in-range`],
      [`${name}:indeterminate`, `${result}:indeterminate`],
      [`${name}:invalid`, `${result}:invalid`],
      [`${name}:lang(es)`, `${result}:lang\\(es\\)`],
      [`${name}:last-child`, `${result}:last-child`],
      [`${name}:last-of-type`, `${result}:last-of-type`],
      [`${name}:link`, `${result}:link`],
      [
        `${name}:not(${name}, ${name})`,
        `${result}:not\\(${result}, ${result}\\)`,
      ],
      [`${name}:nth-child(2)`, `${result}:nth-child\\(2\\)`],
      [`${name}:nth-last-child(2)`, `${result}:nth-last-child\\(2\\)`],
      [`${name}:nth-last-of-type(2)`, `${result}:nth-last-of-type\\(2\\)`],
      [`${name}:nth-of-type(2)`, `${result}:nth-of-type\\(2\\)`],
      [`${name}:only-of-type`, `${result}:only-of-type`],
      [`${name}:only-child`, `${result}:only-child`],
      [`${name}:optional`, `${result}:optional`],
      [`${name}:out-of-range`, `${result}:out-of-range`],
      [`${name}::placeholder`, `${result}::placeholder`],
      [`${name}:read-only`, `${result}:read-only`],
      [`${name}:read-write`, `${result}:read-write`],
      [`${name}:required`, `${result}:required`],
      [`:root`, `:root`],
      [`::selection`, `::selection`],
      [`${name}:target`, `${result}:target`],
      [`${name}:valid`, `${result}:valid`],
      [`${name}:invalid`, `${result}:invalid`],
      [`${name}:user-invalid`, `${result}:user-invalid`],
      [`${name}:visited`, `${result}:visited`],
      [`${name}:indeterminate`, `${result}:indeterminate`],
      [`${name}:has(${name})`, `${result}:has\\(${result}\\)`],
      [`${name} || ${name}`, `${result} \\|\\| ${result}`],
      [
        `${name}:nth-child(2) { ${name} }`,
        `${result}:nth-child\\(2\\) { ${name} }`,
      ],
    ])
    .reduce((acc, arr) => acc.concat(arr));

describe('querySelectorTransform', () => {
  describe('with global registry', () => {
    createTestData(['div', 'div'], ['p', 'p'], ['my-tag', 'my-tag']).forEach(
      ([input, output]) => {
        it(`should not scope ${input}`, () => {
          expect(cssTransform(input, customElements)).to.match(
            new RegExp(output)
          );
        });
      }
    );
  });

  describe('with scoped registry', () => {
    createTestData(
      ['div', 'div'],
      ['p', 'p'],
      ['my-tag', 'my-tag-\\d{1,5}']
    ).forEach(([input, output]) => {
      it(`should transform "${input}"`, () => {
        const registry = new CustomElementRegistry();

        expect(cssTransform(input, registry)).to.match(new RegExp(output));
      });
    });
  });
});
