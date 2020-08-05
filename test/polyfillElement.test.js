import { expect } from '@open-wc/testing';
import { getScopedShadowRoot, getTestTagName } from './utils.js';

import '../index.js'; // loads the polyfill

describe('polyfillElement', () => {
  it('should attach the registry to the shadow root', async () => {
    const Element = class extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });
      }
    };

    customElements.define(getTestTagName(), Element);

    const el = new Element();

    expect(el.shadowRoot.customElements).to.not.be.undefined;
  });

  describe('innerHTML', () => {
    it('should not scope the custom elements in elements whose scope is the document', async () => {
      const $div = document.createElement('div');

      $div.innerHTML = '<my-tag><span>data</span></my-tag>';

      expect($div.innerHTML).to.be.equal('<my-tag><span>data</span></my-tag>');
    });

    it('should scope the custom elements in elements whose scope is a ShadowRoot', async () => {
      const registry = new CustomElementRegistry();
      const shadowRoot = getScopedShadowRoot(registry);
      const $div = shadowRoot.createElement('div');

      $div.innerHTML = '<my-tag><span>data</span></my-tag>';

      expect($div.innerHTML).to.match(
        new RegExp(
          `<my-tag-\\d{1,5} data-tag-name="my-tag"><span>data</span></my-tag-\\d{1,5}>`
        )
      );
    });
  });
});
