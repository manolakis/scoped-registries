/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import {
  getTestTagName,
  getTestElement,
  getScopedShadowRoot,
  createTemplateElement,
  wrapHTML,
} from './utils.js';

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

      it('should set the shadowRoot as the scope of regular elements', async () => {
        const tagName = 'div';
        const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

        const $el = shadowRoot.createElement(tagName);

        expect($el.scope).to.equal(shadowRoot);
      });

      it('should create a scoped element in hierarchy', async () => {
        const tagName = getTestTagName();
        const firstRegistry = new CustomElementRegistry({
          parent: customElements,
        });
        const secondRegistry = new CustomElementRegistry({
          parent: firstRegistry,
        });
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

    describe('importNode', () => {
      it('should import a basic node with deep = false', async () => {
        const shadowRoot = getScopedShadowRoot();
        const $div = document.createElement('div');

        const $clone = shadowRoot.importNode($div, false);

        expect($clone.outerHTML).to.be.equal('<div></div>');
      });

      it('should import a basic template with deep = false', async () => {
        const shadowRoot = getScopedShadowRoot();
        const $template = createTemplateElement('<div></div>');

        const $clone = shadowRoot.importNode($template.content, false);

        expect($clone).to.be.instanceof(DocumentFragment);
        expect($clone.innerHTML).to.be.undefined;
      });

      it('should import a basic node with deep = true', async () => {
        const shadowRoot = await getScopedShadowRoot();
        const $div = document.createElement('div');

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.outerHTML).to.be.equal('<div></div>');
      });

      it('should import a basic template with deep = true', async () => {
        const shadowRoot = getScopedShadowRoot();
        const $template = createTemplateElement('<div></div>');

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone).to.be.instanceof(DocumentFragment);
        expect($clone.firstElementChild.outerHTML).to.be.equal('<div></div>');
      });

      it('should import a node tree with deep = true', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<span>sample</span>';
        const $div = wrapHTML(html);

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.innerHTML).to.be.equal(html);
      });

      it('should import a template content with deep = true', async () => {
        const shadowRoot = getScopedShadowRoot();
        const html = '<div><span>sample</span></div>';
        const $template = createTemplateElement(html);

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone).to.be.instanceof(DocumentFragment);
        expect($clone.firstElementChild.outerHTML).to.be.equal(html);
      });

      it('should import a node tree with an upgraded custom element with deep = true', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        customElements.define(tagName, Element);
        const $div = wrapHTML(`<${tagName}><span>data</span></${tagName}>`);

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.innerHTML).to.be.equal(
          `<${tagName}><span>data</span></${tagName}>`
        );
      });

      it('should import a template with an upgraded custom element with deep = true', async () => {
        const { tagName, Element } = getTestElement();

        const registry = new CustomElementRegistry({ parent: customElements });
        const shadowRoot = getScopedShadowRoot(registry);
        customElements.define(tagName, Element);
        const $template = createTemplateElement(
          `<${tagName}><span>data</span></${tagName}>`
        );

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone).to.be.instanceof(DocumentFragment);
        expect($clone.firstElementChild.outerHTML).to.be.equal(
          `<${tagName}><span>data</span></${tagName}>`
        );
      });

      it('should import a node tree with a non upgraded custom element with deep = true', async () => {
        const tagName = getTestTagName();
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const $div = wrapHTML(`<${tagName}><span>data</span></${tagName}>`);

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.innerHTML).to.match(
          new RegExp(
            `<${tagName}-\\d{1,5} data-tag-name="${tagName}"><span>data</span></${tagName}-\\d{1,5}>`
          )
        );
      });

      it('should import a template with a non upgraded custom element with deep = true', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        customElements.define(tagName, Element);
        const $template = createTemplateElement(
          `<${tagName}><span>data</span></${tagName}>`
        );

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone).to.be.instanceof(DocumentFragment);
        expect($clone.firstElementChild.outerHTML).to.match(
          new RegExp(
            `<${tagName}-\\d{1,5} data-tag-name="${tagName}"><span>data</span></${tagName}-\\d{1,5}>`
          )
        );
      });
    });
  });
});
