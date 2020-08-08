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

  describe('tagName', () => {
    it('should return the unscoped custom element tagName', async () => {
      const registry = new CustomElementRegistry();
      const shadowRoot = getScopedShadowRoot(registry);
      const tagName = getTestTagName();
      shadowRoot.innerHTML = `<${tagName}></${tagName}>`;

      const $el = shadowRoot.firstElementChild;

      expect($el.tagName).to.be.equal(tagName.toUpperCase());
    });
  });

  describe('querySelector', () => {
    it('should be able to find a non custom element in the document', async () => {
      const $div = document.createElement('div');
      const tagName = getTestTagName();
      $div.innerHTML = `<${tagName}></${tagName}>`;

      const $el = $div.querySelector(tagName);

      expect($el).to.not.be.null;
      expect($el.tagName.toLowerCase()).to.be.equal(tagName);
    });

    it('should be able to find a non custom element in a shadow root', async () => {
      const shadowRoot = getScopedShadowRoot();
      const $div = shadowRoot.createElement('div');
      const tagName = getTestTagName();
      $div.innerHTML = `<${tagName}></${tagName}>`;

      const $el = $div.querySelector(tagName);

      expect($el).to.not.be.null;
      expect($el.tagName.toLowerCase()).to.be.equal(tagName);
    });

    it('should be able to find a custom element in a shadow root and a custom registry', async () => {
      const registry = new CustomElementRegistry();
      const shadowRoot = getScopedShadowRoot(registry);
      const $div = shadowRoot.createElement('div');
      const tagName = getTestTagName();
      $div.innerHTML = `<div id="myDiv"><${tagName} class="sample"></${tagName}></div>`;

      const $el = $div.querySelector(`#myDiv ${tagName}.sample`);

      expect($el).to.not.be.null;
      expect($el.tagName.toLowerCase()).to.be.equal(tagName);
    });
  });

  describe('querySelectorAll', () => {
    it('should be able to find a non custom element in the document', async () => {
      const $div = document.createElement('div');
      const tagName = getTestTagName();

      $div.innerHTML = `
        <div>
          <${tagName}></${tagName}>
          <${tagName}></${tagName}>
        </div>
      `;

      const items = $div.querySelectorAll(tagName);

      expect(items.length).to.be.equal(2);
      expect(items[0].tagName.toLowerCase()).to.be.equal(tagName);
      expect(items[1].tagName.toLowerCase()).to.be.equal(tagName);
    });

    it('should be able to find a non custom element in a shadow root', async () => {
      const shadowRoot = getScopedShadowRoot();
      const $div = shadowRoot.createElement('div');
      const tagName = getTestTagName();

      $div.innerHTML = `
        <div>
          <${tagName}></${tagName}>
          <${tagName}></${tagName}>
        </div>
      `;

      const items = $div.querySelectorAll(tagName);

      expect(items.length).to.be.equal(2);
      expect(items[0].tagName.toLowerCase()).to.be.equal(tagName);
      expect(items[1].tagName.toLowerCase()).to.be.equal(tagName);
    });

    it('should be able to find a custom element in a shadow root and a custom registry', async () => {
      const registry = new CustomElementRegistry();
      const shadowRoot = getScopedShadowRoot(registry);
      const $div = shadowRoot.createElement('div');
      const tagName = getTestTagName();

      $div.innerHTML = `
        <div>
          <${tagName}></${tagName}>
          <${tagName}></${tagName}>
        </div>
      `;

      const items = $div.querySelectorAll(tagName);

      expect(items.length).to.be.equal(2);
      expect(items[0].tagName.toLowerCase()).to.be.equal(tagName);
      expect(items[1].tagName.toLowerCase()).to.be.equal(tagName);
    });
  });
});
