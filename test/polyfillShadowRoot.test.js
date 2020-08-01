/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import { getTestTagName, getScopedShadowRoot } from './utils.js';

import '../index.js'; // loads the polyfill

describe('polyfillShadowRoot', () => {
  describe('CustomElementRegistry', () => {
    describe('createElement', () => {
      it('should create a scoped custom element', async () => {
        const tagName = getTestTagName();
        const shadowRoot = getScopedShadowRoot();

        const $el = shadowRoot.createElement(tagName);

        expect($el.tagName.toLowerCase()).to.be.equal(tagName);
      });

      it('should create a regular element', async () => {
        const tagName = 'div';
        const shadowRoot = getScopedShadowRoot();

        const $el = shadowRoot.createElement(tagName);

        expect($el.tagName.toLowerCase()).to.equal(tagName);
      });
    });
  });

  describe('ScopedCustomElementRegistry', () => {
    describe('createElement', () => {
      it('should create a scoped custom element', async () => {
        const tagName = getTestTagName();
        const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

        const $el = shadowRoot.createElement(tagName);

        expect($el.tagName.toLowerCase()).to.match(
          new RegExp(`${tagName}-\\d{1,5}`)
        );
      });

      it('should create a regular element', async () => {
        const tagName = 'div';
        const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

        const $el = shadowRoot.createElement(tagName);

        expect($el.tagName.toLowerCase()).to.equal(tagName);
      });

      it('should set a Document the scope of regular elements', async () => {
        const tagName = 'div';
        const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

        const Sel = shadowRoot.createElement(tagName);

        expect(Sel.scope).to.equal(document);
      });

      it('should create a scoped element in hierarchy', async () => {
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

        expect(el1).to.be.instanceof(Element);
        expect(el2).to.be.instanceof(Element2);
        expect(el3).to.be.instanceof(Element3);
      });
    });
  });
});
