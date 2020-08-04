/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import { getTestElement, getScopedShadowRoot } from './utils.js';

import '../index.js'; // loads the polyfill

describe('polyfillDocument', () => {
  it('should define the scope of the created elements', async () => {
    const { tagName, Element: Element1 } = getTestElement();
    const { Element: Element2 } = getTestElement();
    const { Element: Element3 } = getTestElement();
    const firstRegistry = new CustomElementRegistry({ parent: customElements });
    const secondRegistry = new CustomElementRegistry({ parent: firstRegistry });
    const secondRegistryShadowRoot = getScopedShadowRoot(secondRegistry);

    customElements.define(tagName, Element1);
    const el1 = secondRegistryShadowRoot.createElement(tagName);

    firstRegistry.define(tagName, Element2);
    const el2 = secondRegistryShadowRoot.createElement(tagName);

    secondRegistry.define(tagName, Element3);
    const el3 = secondRegistryShadowRoot.createElement(tagName);

    expect(el1.scope).to.be.equal(document);
    expect(el2.scope).to.be.equal(firstRegistry);
    expect(el3.scope).to.be.equal(secondRegistry);
  });
});
