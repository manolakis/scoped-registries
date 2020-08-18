/* eslint no-global-assign:0 */
import { polyfillCustomElementRegistry } from './src/polyfillCustomElementRegistry.js';
import { ScopedCustomElementRegistry } from './src/ScopedCustomElementRegistry.js';
import { polyfillElement } from './src/polyfillElement.js';
import { polyfillCSSStyleSheet } from './src/polyfillCSSStyleSheet.js';
import { supportsAdoptingStyleSheets } from './src/constants.js';

if (!customElements.getRegistry) {
  polyfillCustomElementRegistry(customElements);
  CustomElementRegistry = ScopedCustomElementRegistry;
  polyfillElement();

  if (supportsAdoptingStyleSheets) {
    polyfillCSSStyleSheet();
  }
}
