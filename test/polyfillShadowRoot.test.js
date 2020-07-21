/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect, fixture } from '@open-wc/testing';

import '../index.js'; // loads the polyfill

let counter = 0;

const getScopedShadowRoot = async (
  customElementRegistry = window.customElements
) => {
  const name = `shadow-root-${(counter += 1)}`;

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

describe('polyfillShadowRoot', () => {
  describe('CustomElementRegistry', () => {
    describe('createElement', () => {
      it('should create a scoped custom element', async () => {
        const tagName = 'my-tag';
        const shadowRoot = await getScopedShadowRoot();

        const el = shadowRoot.createElement(tagName);

        expect(el.tagName.toLowerCase()).to.be.equal(tagName);
      });

      it('should create a regular element', async () => {
        const tagName = 'div';
        const shadowRoot = await getScopedShadowRoot();

        const el = shadowRoot.createElement(tagName);

        expect(el.tagName.toLowerCase()).to.equal(tagName);
      });
    });
  });

  describe('ScopedCustomElementRegistry', () => {
    describe('createElement', () => {
      it('should create a scoped custom element', async () => {
        const tagName = 'my-tag';
        const shadowRoot = await getScopedShadowRoot(
          new CustomElementRegistry()
        );

        const el = shadowRoot.createElement(tagName);

        expect(el.tagName.toLowerCase()).to.match(
          new RegExp(`${tagName}-\\d{1,5}`)
        );
      });

      it('should create a regular element', async () => {
        const tagName = 'div';
        const shadowRoot = await getScopedShadowRoot(
          new CustomElementRegistry()
        );

        const el = shadowRoot.createElement(tagName);

        expect(el.tagName.toLowerCase()).to.equal(tagName);
      });

      it('should set a Document the scope of regular elements', async () => {
        const tagName = 'div';
        const shadowRoot = await getScopedShadowRoot(
          new CustomElementRegistry()
        );

        const el = shadowRoot.createElement(tagName);

        expect(el.scope).to.equal(document);
      });

      it('should create a scoped element in hierarchy', async () => {
        const tagName = 'sw-cantonica';
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

        expect(el1).to.be.instanceof(Cantonica1);
        expect(el2).to.be.instanceof(Cantonica2);
        expect(el3).to.be.instanceof(Cantonica3);
      });
    });
  });
});
