/* eslint no-global-assign:0, no-param-reassign:0, class-methods-use-this:0 */

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

  return shadowRoot;
};
