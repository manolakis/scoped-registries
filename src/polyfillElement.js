/* eslint object-shorthand:0 */
import { definitionsRegistry } from './definitionsRegistry.js';
import { polyfillShadowRoot } from './polyfillShadowRoot.js';
import { htmlTransform } from './htmlTransform.js';
import { cssTransform } from './cssTransform.js';
import { HTMLCollection } from './HTMLCollection.js';

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
  node.__scope = scope;
};

Object.defineProperty(Element.prototype, 'innerHTML', {
  ...originalInnerHTMLDescriptor,
  set: function (value) {
    const scope = getScope(this);
    const registry = getRegistry(scope);

    const $data = originalInnerHTMLDescriptor.set.call(
      this,
      htmlTransform(value, registry)
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
  get: function () {
    const $tagName = originalTagNameDescriptor.get.call(this);
    const { originalTagName = $tagName } =
      definitionsRegistry.findByTagName($tagName.toLowerCase()) || {};

    return originalTagName.toUpperCase();
  },
});

Object.defineProperty(Element.prototype, 'scope', {
  get: function () {
    return this.__scope || document;
  },
  set: function () {
    throw new Error("'scope' is a readonly property");
  },
});

export const polyfillElement = () => {
  const that = Element.prototype;

  // maintains the original methods available
  that.__attachShadow = that.attachShadow;
  that.__querySelector = that.querySelector;
  that.__querySelectorAll = that.querySelectorAll;
  that.__getElementsByTagName = that.getElementsByTagName;
  that.__getElementsByTagNameNS = that.getElementsByTagNameNS;

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

  /**
   *
   * @param tagName
   * @return {HTMLCollection|any}
   */
  that.getElementsByTagName = function getElementsByTagName(tagName) {
    const tagDefinitions = definitionsRegistry.findByOriginalTagName(tagName);

    switch (tagDefinitions.length) {
      case 0:
        return this.__getElementsByTagName(tagName);
      case 1:
        return this.__getElementsByTagName(tagDefinitions[0].tagName);
      default:
        // FIXME this is not a live collection. Maybe with an observer?
        return new HTMLCollection(
          tagDefinitions
            .map(({ tagName: scopedTagName }) =>
              Array.from(this.__getElementsByTagName(scopedTagName))
            )
            .reduce((acc, items) => acc.concat(...items), [])
        );
    }
  };

  that.getElementsByTagNameNS = function getElementsByTagNameNS(
    namespace,
    tagName
  ) {
    const tagDefinitions = definitionsRegistry.findByOriginalTagName(tagName);

    switch (tagDefinitions.length) {
      case 0:
        return this.__getElementsByTagNameNS(namespace, tagName);
      case 1:
        return this.__getElementsByTagNameNS(
          namespace,
          tagDefinitions[0].tagName
        );
      default:
        // FIXME this is not a live collection. Maybe with an observer?
        return new HTMLCollection(
          tagDefinitions
            .map(({ tagName: scopedTagName }) =>
              Array.from(
                this.__getElementsByTagNameNS(namespace, scopedTagName)
              )
            )
            .reduce((acc, items) => acc.concat(...items), [])
        );
    }
  };
};
