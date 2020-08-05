/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */
import { definitionsRegistry } from './definitionsRegistry.js';

/**
 * Checks if is a custom element tag name.
 * @param {string} tagName
 * @return {boolean}
 */
const isCustomElement = tagName => tagName.includes('-');

/**
 * Checks if a Node is a custom element.
 * @param {Node} node
 * @return {boolean}
 */
const isCustomElementNode = node =>
  node.nodeType === 1 && isCustomElement(node.tagName);

/**
 * Check if a custom element is upgraded.
 * @param {Node} node
 * @return {boolean}
 */
const isUpgraded = node =>
  Object.getPrototypeOf(node).constructor !== HTMLElement;

/**
 * Enhances a ShadowRoot to allow scoped elements.
 * @param {ShadowRoot} shadowRoot
 * @param {CustomElementRegistry} registry
 * @return {ShadowRoot}
 */
export const polyfillShadowRoot = (shadowRoot, registry) => {
  /** type {CustomElementRegistry} */
  shadowRoot.customElements = registry;

  /**
   * Creates an element using the CustomElementRegistry of the ShadowRoot.
   * @param {string} tagName
   * @param {ElementCreationOptions} [options]
   */
  shadowRoot.createElement = function createElement(tagName, options) {
    if (!isCustomElement(tagName)) {
      const $el = document.createElement(tagName, options);

      $el.scope = shadowRoot;

      return $el;
    }

    const scope = registry.getRegistry(tagName) || registry;
    const element = document.createElement(
      definitionsRegistry.getTagName(tagName, scope),
      options
    );

    if (!scope.__isRoot()) {
      element.scope = scope;
    }

    return element;
  };

  /**
   * Creates an element using the CustomElementRegistry of the ShadowRoot.
   * @param {string|null} namespaceURI
   * @param {string} tagName
   * @param {ElementCreationOptions} [options]
   */
  shadowRoot.createElementNS = function createElementNS(
    namespaceURI,
    tagName,
    options
  ) {
    if (!isCustomElement(tagName)) {
      return document.createElementNS(namespaceURI, tagName, options);
    }

    const scope = registry.getRegistry(tagName) || registry;
    const element = document.createElementNS(
      namespaceURI,
      definitionsRegistry.getTagName(tagName, scope),
      options
    );

    if (!scope.__isRoot()) {
      element.scope = scope;
    }

    return element;
  };

  /**
   * Creates a copy of a Node or DocumentFragment from another document, to be inserted into the current document
   * later. The imported node is not yet included in the document tree. To include it, you need to call an insertion
   * method such as appendChild() or insertBefore() with a node that is currently in the document tree.
   *
   * @param {Node} externalNode
   * @param {boolean} [deep]
   */
  shadowRoot.importNode = function importNode(externalNode, deep) {
    return this.__importNode(externalNode, deep);
  };

  /**
   * @param {Node} externalNode
   * @param {boolean} [deep=true]
   * @return {Node}
   */
  shadowRoot.__importNode = function __importNode(externalNode, deep = true) {
    return this.__transformCustomElements(externalNode.cloneNode(deep));
  };

  /**
   * Transforms the custom elements to use the custom registry defined ones.
   * @param  {Node} node
   * @return {Element}
   * @private
   */
  shadowRoot.__transformCustomElements = function __transformCustomElements(
    node
  ) {
    node.childNodes.forEach(childNode => {
      const transformedNode = this.__transformCustomElements(childNode);

      if (transformedNode !== childNode) {
        node.replaceChild(transformedNode, childNode);
      }
    });

    if (this.__shouldScope(node)) {
      return this.__transformNode(node);
    }

    return node;
  };

  /**
   * Transforms an unscoped and non upgraded custom element into a scoped one. It may not been defined.
   * @param {Node} node
   * @return {Element}
   */
  shadowRoot.__transformNode = function __transformNode(node) {
    const children = [];
    const $div = this.createElement('div');

    node.childNodes.forEach(child => {
      children.push(child);
      node.removeChild(child);
    });

    $div.innerHTML = node.outerHTML;
    children.forEach(child => $div.firstElementChild.appendChild(child));

    return $div.firstElementChild;
  };

  /**
   * Checks if node must be scoped.
   *
   * @param {Node} node
   * @return {boolean}
   * @private
   */
  shadowRoot.__shouldScope = function __shouldScope(node) {
    return (
      isCustomElementNode(node) &&
      !isUpgraded(node) &&
      !this.customElements.get(
        node.dataset.tagName || node.tagName.toLowerCase()
      )
    );
  };

  return shadowRoot;
};
