/* eslint no-global-assign:0 */
import { polyfillCustomElementRegistry } from './src/polyfillCustomElementRegistry.js';
import { ScopedCustomElementRegistry } from './src/ScopedCustomElementRegistry.js';
import { polyfillElement } from './src/polyfillElement.js';

if (!customElements.getRegistry) {
  polyfillCustomElementRegistry(customElements);
  CustomElementRegistry = ScopedCustomElementRegistry;
  polyfillElement();
}
