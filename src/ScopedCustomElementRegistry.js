/* eslint no-global-assign:0, class-methods-use-this:0 */
import { OriginalCustomElementRegistry } from './constants.js';
import { polyfillCustomElementRegistry } from './polyfillCustomElementRegistry.js';

export class ScopedCustomElementRegistry {
  /**
   * @constructor
   * @param {CustomElementRegistry} [parent]
   */
  constructor(parent) {
    if (
      parent &&
      !(
        parent instanceof OriginalCustomElementRegistry ||
        parent instanceof ScopedCustomElementRegistry
      )
    ) {
      throw new Error('Parent must be a CustomElementRegistry instance');
    }

    this.parent = parent;

    return polyfillCustomElementRegistry(this);
  }

  /**
   * Defines a new custom element.
   * @param {string} name
   * @param {CustomElementConstructor} constructor
   * @param {ElementDefinitionOptions} [options]
   */
  define(name, constructor, options) {
    return customElements.define(name, constructor, options);
  }

  /**
   * Returns the closest constructor defined for a tag name in a chain of registries, or undefined if the custom
   * element is not defined.
   * @param {string} name
   * @returns {CustomElementConstructor|undefined}
   */
  get(name) {
    return customElements.get(name);
  }

  /**
   * Returns the closest registry in which a tag name is defined or undefined if the tag is not defined.
   * @param name
   * @returns {CustomElementRegistry|undefined}
   */
  // getRegistry(name) {}

  /**
   * Upgrades all shadow-containing custom elements in a Node subtree, even before they are connected to the main
   * document.
   * @param {Node} root
   */
  upgrade(root) {
    customElements.upgrade(root);
  }

  /**
   * Returns an empty promise that resolves when a custom element becomes defined with the given name. If such a
   * custom element is already defined, the returned promise is immediately fulfilled.
   * @param {string} name
   * @returns {Promise<void>}
   */
  whenDefined(name) {
    return customElements.whenDefined(name);
  }
}
