/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */
import { OriginalCustomElementRegistry } from './constants.js';
import { definitionsRegistry } from './definitionsRegistry.js';

export const polyfillCustomElementRegistry = that => {
  // maintains the original methods available
  that.__define = that.define;
  that.__get = that.get;
  that.__whenDefined = that.whenDefined;

  /**
   * Checks if is the root Custom Element Registry
   * @return {boolean}
   * @private
   */
  that.__isRoot = () => that instanceof OriginalCustomElementRegistry;

  /**
   * Defines a new custom element. Elements defined in root registry are not scoped.
   * @param {string} name
   * @param {CustomElementConstructor} constructor
   * @param {ElementDefinitionOptions} [options]
   */
  that.define = (name, constructor, options) => {
    const isRoot = that.__isRoot();
    const tagName = definitionsRegistry.getTagName(name, that);
    const definedConstructor = isRoot
      ? constructor
      : class extends constructor {};

    if (that.__isRoot()) {
      definitionsRegistry.add({
        tagName,
        originalTagName: name,
        constructor: definedConstructor,
        registry: that,
      });
    }

    that.__define(tagName, definedConstructor, options);

    return definedConstructor;
  };

  /**
   * Returns the closest constructor defined for a tag name in a chain of registries, or undefined if the custom
   * element is not defined.
   * @param {string} name
   * @returns {CustomElementConstructor|undefined}
   */
  that.get = name => {
    let registry = that;

    while (registry) {
      const item = definitionsRegistry
        .findByRegistry(registry)
        .find(({ originalTagName }) => originalTagName === name);

      if (item) {
        return item.constructor;
      }

      registry = registry.parent;
    }

    return undefined;
  };

  /**
   * Returns the closest registry in which a tag name is defined or undefined if the tag is not defined.
   * @param {string} name
   * @returns {CustomElementRegistry|undefined}
   */
  that.getRegistry = name => {
    let registry = that;

    while (registry) {
      const registryContainsTagName = !!definitionsRegistry
        .findByRegistry(registry)
        .find(({ originalTagName }) => originalTagName === name);

      if (registryContainsTagName) {
        return registry;
      }

      registry = registry.parent;
    }

    return undefined;
  };

  /**
   * Returns an empty promise that resolves when a custom element becomes defined with the given name. If such a
   * custom element is already defined, the returned promise is immediately fulfilled.
   * @param {string} name
   * @returns {Promise<void>}
   */
  that.whenDefined = name =>
    that.__isRoot()
      ? that.__whenDefined(name)
      : that.__whenDefined(definitionsRegistry.getTagName(name, that));

  return that;
};
