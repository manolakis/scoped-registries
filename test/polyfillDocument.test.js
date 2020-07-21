/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect, fixture } from '@open-wc/testing';

import '../index.js'; // loads the polyfill

let counter = 0;

const getScopedShadowRoot = async (
  customElementRegistry = window.customElements
) => {
  const name = `test-document-${(counter += 1)}`;

  const klass = class extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({
        mode: 'open',
        customElements: customElementRegistry,
      });
    }
  };

  window.customElements.define(name, klass);

  const el = await fixture(`<${name}></${name}>`);

  return el.shadowRoot;
};

describe('polyfillDocument', () => {
  it('should define the scope of the created elements', async () => {
    const tagName = 'sw-d-qar';
    const firstRegistry = new CustomElementRegistry(window.customElements);
    const secondRegistry = new CustomElementRegistry(firstRegistry);
    const shadowRoot = await getScopedShadowRoot(secondRegistry);

    class Cantonica1 extends HTMLElement {}
    class Cantonica2 extends HTMLElement {}
    class Cantonica3 extends HTMLElement {}

    customElements.define(tagName, Cantonica1);
    const el1 = shadowRoot.createElement(tagName);

    firstRegistry.define(tagName, Cantonica2);
    const el2 = shadowRoot.createElement(tagName);

    secondRegistry.define(tagName, Cantonica3);
    const el3 = shadowRoot.createElement(tagName);

    expect(el1.scope).to.be.equal(document);
    expect(el2.scope).to.be.equal(firstRegistry);
    expect(el3.scope).to.be.equal(secondRegistry);
  });
});
