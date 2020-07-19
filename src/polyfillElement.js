import { polyfillShadowRoot } from './polyfillShadowRoot.js';

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
