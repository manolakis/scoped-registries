/* eslint max-classes-per-file:0 */
let counter = 0;

export const getTestTagName = () => {
  counter += 1;

  return `test-${counter}-element`;
};

/**
 * Creates a test element and a unique tagName.
 *
 * @return {{Element: typeof HTMLElement, tagName: string}}
 */
export const getTestElement = () => ({
  tagName: getTestTagName(),
  Element: class extends HTMLElement {},
});

/**
 * Gets a shadowRoot.
 *
 * @param {CustomElementRegistry} customElementRegistry
 * @return {ShadowRoot}
 */
export const getScopedShadowRoot = (
  customElementRegistry = window.customElements
) => {
  const tagName = getTestTagName();
  const Element = class extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({
        mode: 'open',
        customElements: customElementRegistry,
      });
    }
  };

  window.customElements.define(tagName, Element);

  const { shadowRoot } = new Element();

  return shadowRoot;
};

/**
 * Creates a template.
 *
 * @param {string} html - template's content
 * @return {HTMLTemplateElement}
 */
export const createTemplateElement = html => {
  const template = document.createElement('template');

  template.innerHTML = html;

  return template;
};

/**
 * Wraps HTML inside a DIV.
 *
 * @param {string} html
 * @param {Document|ShadowRoot} root
 * @return {HTMLDivElement}
 */
export const wrapHTML = (html, root = document) => {
  const div = root.createElement('div');

  div.innerHTML = html;

  return div;
};
