/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */
import { createUniqueTag } from './createUniqueTag.js';
import { OriginalCustomElementRegistry } from './constants.js';

export const polyfillCustomElementRegistry = that => {
  // maintains the original methods available
  that.__define = that.define;
  that.__get = that.get;

  /**
   * Contains the registry tags cache
   * @type {Map<string, string>}
   * @private
   */
  that.__tagsCache = new Map();

  /**
   * Contains the registry defined tags collection
   * @type {Set<string>}
   * @private
   */
  that.__definedTags = new Set();

  /**
   * Checks if is the root Custom Element Registry
   * @return {boolean}
   * @private
   */
  that.__isRoot = () => that instanceof OriginalCustomElementRegistry;

  /**
   * Returns a unique tag name for the specified tag name.
   * @param {string} name
   * @return {string}
   * @private
   */
  that.__getUniqueTagName = name => {
    if (!that.__tagsCache.has(name)) {
      that.__tagsCache.set(name, createUniqueTag(name));
    }
    return that.__tagsCache.get(name);
  };

  /**
   * Defines a new custom element. Elements defined in root registry are not scoped.
   * @param {string} name
   * @param {CustomElementConstructor} constructor
   * @param {ElementDefinitionOptions} [options]
   */
  that.define = (name, constructor, options) => {
    that.__definedTags.add(name);

    return that.__isRoot()
      ? that.__define(name, constructor, options)
      : that.__define(
          that.__getUniqueTagName(name),
          class extends constructor {},
          options
        );
  };

  /**
   * Returns the closest constructor defined for a tag name in a chain of registries, or undefined if the custom
   * element is not defined.
   * @param {string} name
   * @returns {CustomElementConstructor|undefined}
   */
  that.get = name => {
    const registry = that.getRegistry(name);

    if (registry) {
      return registry.__isRoot()
        ? registry.__get(name)
        : registry.__get(registry.__tagsCache.get(name));
    }

    return undefined;
  };

  /**
   * Returns the closest registry in which a tag name is defined or undefined if the tag is not defined.
   * @param name
   * @returns {CustomElementRegistry|undefined}
   */
  that.getRegistry = name => {
    let registry = that;

    while (registry) {
      if (registry.__definedTags.has(name)) {
        return registry;
      }

      registry = registry.parent;
    }

    return undefined;
  };

  return that;
};
