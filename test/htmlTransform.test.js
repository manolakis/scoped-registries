import { expect } from '@open-wc/testing';
import { htmlTransform } from '../src/htmlTransform.js';

import '../index.js'; // loads the polyfill

describe('html', () => {
  const registry = new CustomElementRegistry();

  registry.define('mandalore-planet', class extends HTMLElement {});

  [
    {
      input: 'Sample text',
      output: 'Sample text',
    },
    {
      input: 'Sample <mandalore-planet>Text</mandalore-planet>',
      output:
        'Sample <mandalore-planet-\\d{1,5}>Text</mandalore-planet-\\d{1,5}>',
    },
    {
      input: '<mandalore-planet class="sample"></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample"></mandalore-planet-\\d{1,5}>',
    },
    {
      input:
        '<mandalore-planet\tclass="sample"><span>test</span></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample"><span>test</span></mandalore-planet-\\d{1,5}>',
    },
    {
      input: '<mandalore-planet\rclass="sample"></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample"></mandalore-planet-\\d{1,5}>',
    },
    {
      input: '<mandalore-planet class="sample"></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample"></mandalore-planet-\\d{1,5}>',
    },
    {
      input:
        '<mandalore-planet class="sample" data-test="<my-component>"></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample" data-test="<my-component>"></mandalore-planet-\\d{1,5}>',
    },
    {
      input:
        '<mandalore-planet class="sample" data-test=\'<my-component>\'></mandalore-planet>',
      output:
        '<mandalore-planet-\\d{1,5} class="sample" data-test=\'<my-component>\'></mandalore-planet-\\d{1,5}>',
    },
  ].forEach(({ input, output }, index) => {
    it(`should transform strings tags into the actual registered tags - ${index}`, () => {
      // @ts-ignore
      expect(htmlTransform(input, registry)).to.match(new RegExp(output));
    });
  });
});
