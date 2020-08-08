import { createUniqueTag } from './createUniqueTag.js';

/**
 * @typedef {Object} TagDefinition
 * @property {string} tagName - real tag name used for component definition
 * @property {string} originalTagName - original tag name used by the user to define the component
 * @property {Element} [constructor] - custom element constructor
 * @property {CustomElementRegistry} registry - Registry in which the custom element is going to be defined
 */

class DefinitionsRegistry {
  constructor() {
    /** @type {TagDefinition[]} */
    this._items = [];
  }

  /**
   * Adds a new tag definition.
   *
   * @param {TagDefinition} tagDefinition
   */
  add(tagDefinition) {
    ['tagName', 'originalTagName', 'registry'].forEach(name => {
      if (!tagDefinition[name]) {
        throw new Error(`"${name}" is mandatory`);
      }
    });

    const { tagName, originalTagName, constructor, registry } = tagDefinition;

    if (this.findByConstructor(constructor)) {
      throw new Error(
        'this constructor has already been used with this registry'
      );
    }

    const item = this.findByTagName(tagName);

    if (item) {
      if (item.constructor) {
        throw new Error(
          `the name "${tagName}" has already been used with this registry`
        );
      }

      item.constructor = constructor;
    } else {
      this._items.push({
        tagName,
        originalTagName,
        constructor,
        registry,
      });
    }
  }

  /**
   * Returns the scopedTagName associated to an original tagName used in a registry. If there is no
   * scopedTagName then it returns a new scopedTagName or the originalTagName in case of the global
   * registry.
   *
   * @param {string} originalTagName
   * @param {CustomElementRegistry} registry
   * @return {string}
   */
  getTagName(originalTagName, registry) {
    const { tagName: itemTagName } =
      this.findByRegistry(registry).find(
        ({ originalTagName: x }) => x === originalTagName
      ) || {};

    if (itemTagName) {
      return itemTagName;
    }

    // in case the tagName is not found and is not the global registry we must register an scoped tag name because
    // the component could be defined later.
    if (!registry.__isRoot()) {
      const scopedTagName = createUniqueTag(originalTagName);

      this.add({
        registry,
        constructor: undefined,
        tagName: scopedTagName,
        originalTagName,
      });

      return scopedTagName;
    }

    return originalTagName;
  }

  /**
   * Finds a tagDefinition by the tagName.
   *
   * @param {string} tagName
   * @return {TagDefinition|undefined}
   */
  findByTagName(tagName) {
    if (!tagName) {
      return undefined;
    }

    return this._items.find(({ tagName: x }) => x === tagName);
  }

  /**
   * Finds a list of TagDefinitions by the originalTagName.
   *
   * @param {string} tagName
   * @return {TagDefinition[]}
   */
  findByOriginalTagName(tagName) {
    return this._items.filter(
      ({ originalTagName }) => originalTagName === tagName
    );
  }

  /**
   * Finds a TagDefinition by the constructor.
   *
   * @param {Element} constructor
   * @return {TagDefinition|undefined}
   */
  findByConstructor(constructor) {
    if (!constructor) {
      return undefined;
    }

    return this._items.find(({ constructor: x }) => x === constructor);
  }

  /**
   * Finds a list of TagDefinition by the registry in which they are defined.
   *
   * @param {CustomElementRegistry} registry
   * @return {TagDefinition[]}
   */
  findByRegistry(registry) {
    return this._items.filter(({ registry: x }) => x === registry);
  }
}

/** @type {DefinitionsRegistry} */
export const definitionsRegistry = new DefinitionsRegistry();
