/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import { getTestTagName, getScopedShadowRoot } from './utils.js';

import '../index.js'; // loads the polyfill

describe('polyfillDocument', () => {
  it('should define the scope of the created elements', async () => {
    const tagName = getTestTagName();
    const firstRegistry = new CustomElementRegistry(window.customElements);
    const secondRegistry = new CustomElementRegistry(firstRegistry);
    const shadowRoot = getScopedShadowRoot(secondRegistry);

    const Element = class extends HTMLElement {};
    const Element2 = class extends HTMLElement {};
    const Element3 = class extends HTMLElement {};

    customElements.define(tagName, Element);
    const el1 = shadowRoot.createElement(tagName);

    firstRegistry.define(tagName, Element2);
    const el2 = shadowRoot.createElement(tagName);

    secondRegistry.define(tagName, Element3);
    const el3 = shadowRoot.createElement(tagName);

    expect(el1.scope).to.be.equal(document);
    expect(el2.scope).to.be.equal(firstRegistry);
    expect(el3.scope).to.be.equal(secondRegistry);
  });
});
