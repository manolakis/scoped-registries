import { expect, fixture } from '@open-wc/testing';
import { polyfillElement } from '../src/polyfillElement.js';

polyfillElement();

describe('polyfillElement', () => {
  it('should attach the registry to the shadow root', async () => {
    class Crait extends HTMLElement {
      constructor() {
        super();

        this.attachShadow({ mode: 'open' });
      }
    }

    customElements.define('sw-crait', Crait);

    const el = await fixture('<sw-crait></sw-crait>');

    expect(el.shadowRoot.customElements).to.not.be.undefined;
  });
});
