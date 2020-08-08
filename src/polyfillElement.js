import { definitionsRegistry } from './definitionsRegistry.js';
import { polyfillShadowRoot } from './polyfillShadowRoot.js';
import { transform } from './transform.js';
import { cssTransform } from './cssTransform.js';

const getScope = element => {
  const rootNode = element.getRootNode();

  if (rootNode instanceof ShadowRoot) {
    return rootNode;
  }

  if (rootNode instanceof Document) {
    return rootNode;
  }

  if (element.scope instanceof ShadowRoot) {
    return element.scope;
  }

  return document;
};

const getRegistry = node => {
  if (node instanceof ShadowRoot) {
    return node.customElements;
  }

  return window.customElements;
};

const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'innerHTML'
);

const setScope = (node, scope) => {
  node.childNodes.forEach(child => setScope(child, scope));
  // eslint-disable-next-line no-param-reassign
  node.scope = scope;
};

Object.defineProperty(Element.prototype, 'innerHTML', {
  ...originalInnerHTMLDescriptor,
  // eslint-disable-next-line object-shorthand,func-names
  set: function (value) {
    const scope = getScope(this);
    const registry = getRegistry(scope);

    const $data = originalInnerHTMLDescriptor.set.call(
      this,
      transform(value, registry)
    );

    if (scope !== document) {
      this.childNodes.forEach(child => setScope(child, scope));
    }

    return $data;
  },
});

const originalTagNameDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'tagName'
);

Object.defineProperty(Element.prototype, 'tagName', {
  ...originalTagNameDescriptor,
  // eslint-disable-next-line object-shorthand,func-names
  get: function () {
    const $tagName = originalTagNameDescriptor.get.call(this);
    const { originalTagName = $tagName } =
      definitionsRegistry.findByTagName($tagName.toLowerCase()) || {};

    return originalTagName.toUpperCase();
  },
});

export const polyfillElement = () => {
  const that = Element.prototype;

  // maintains the original methods available
  that.__attachShadow = that.attachShadow;
  that.__querySelector = that.querySelector;
  that.__querySelectorAll = that.querySelectorAll;

  /**
   * Creates a shadow root for element and returns it.
   * @param {ShadowRootMode} mode
   * @param {CustomElementRegistry} customElements
   */
  that.attachShadow = function attachShadow({
    mode,
    customElements = window.customElements,
  }) {
    return polyfillShadowRoot(this.__attachShadow({ mode }), customElements);
  };

  /**
   * Returns the first Element within the document that matches the specified selector, or group of selectors. If no
   * matches are found, null is returned.
   * @param {string} query
   * @return {Element|null}
   */
  that.querySelector = function querySelector(query) {
    const scope = getScope(this);
    const registry = getRegistry(scope);

    return this.__querySelector(cssTransform(query, registry));
  };

  /**
   * Returns a static (not live) NodeList representing a list of the document's elements that match the specified
   * group of selectors.
   * @param {string} query
   * @return {Element[]}
   */
  that.querySelectorAll = function querySelectorAll(query) {
    const scope = getScope(this);
    const registry = getRegistry(scope);

    return this.__querySelectorAll(cssTransform(query, registry));
  };
};
