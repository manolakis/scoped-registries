/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */
import { definitionsRegistry } from './definitionsRegistry.js';

/**
 * Checks if is a custom element tag name.
 * @param {string} tagName
 * @return {boolean}
 */
const isCustomElement = tagName => tagName.includes('-');

/**
 * Enhances a ShadowRoot to allow scoped elements.
 * @param {ShadowRoot} shadowRoot
 * @param {CustomElementRegistry} registry
 * @return {ShadowRoot}
 */
export const polyfillShadowRoot = (shadowRoot, registry) => {
  /**
   * type {CustomElementRegistry}
   */
  shadowRoot.customElements = registry;

  /**
   * Creates an element using the CustomElementRegistry of the ShadowRoot.
   * @param {string} tagName
   * @param {ElementCreationOptions} [options]
   */
  shadowRoot.createElement = function createElement(tagName, options) {
    if (!isCustomElement(tagName)) {
      return document.createElement(tagName, options);
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

  return shadowRoot;
};
