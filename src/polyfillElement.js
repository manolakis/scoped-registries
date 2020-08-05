import { polyfillShadowRoot } from './polyfillShadowRoot.js';
import { transform } from './transform.js';

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

export const polyfillElement = () => {
  const that = Element.prototype;

  // maintains the original methods available
  that.__attachShadow = that.attachShadow;

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
};
