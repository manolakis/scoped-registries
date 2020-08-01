import { expect } from '@open-wc/testing';
import { getTestTagName } from './utils.js';

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
});
