/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */

export const polyfillDocument = that => {
  // maintains the original methods available
  that.__createElement = that.createElement;
  that.__createElementNS = that.createElementNS;

  /**
   * Creates an element using the CustomElementRegistry of the ShadowRoot
   * @param {string} tagName
   * @param {ElementCreationOptions} [options]
   */
  that.createElement = function createElement(tagName, options) {
    const elem = this.__createElement(tagName, options);

    elem.scope = this;

    return elem;
  };

  /**
   * Creates an element using the CustomElementRegistry of the ShadowRoot
   * @param {string|null} namespaceURI
   * @param {string} tagName
   * @param {ElementCreationOptions} [options]
   */
  that.createElementNS = function createElementNS(
    namespaceURI,
    tagName,
    options
  ) {
    const elem = this.__createElementNS(namespaceURI, tagName, options);

    elem.scope = this;

    return elem;
  };
};
