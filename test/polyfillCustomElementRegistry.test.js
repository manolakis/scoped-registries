/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import { polyfillCustomElementRegistry } from '../src/polyfillCustomElementRegistry.js';
import { ScopedCustomElementRegistry } from '../src/ScopedCustomElementRegistry.js';

polyfillCustomElementRegistry(customElements);
CustomElementRegistry = ScopedCustomElementRegistry;

describe('polyfillCustomElementRegistry', () => {
  describe('Global Custom Element Registry', () => {
    it('should contain a cache for the local defined elements', async () => {
      expect(customElements.__tagsCache).to.not.be.undefined;
    });

    describe('define', () => {
      it('should not scope defined elements', async () => {
        customElements.define('sw-ahch-to', class extends HTMLElement {});

        expect(customElements.__tagsCache.has('sw-ahch-to')).to.be.false;
      });
    });
  });

  describe('Scoped Custom Element Registry', () => {
    it('should be able to be instantiated', async () => {
      const registry = new CustomElementRegistry();

      expect(registry).to.not.be.undefined;
    });

    it('should be able to be instantiated with a parent reference', async () => {
      const registry = new CustomElementRegistry(customElements);
      const registry2 = new CustomElementRegistry(registry);

      expect(registry).to.not.be.undefined;
      expect(registry2).to.not.be.undefined;
    });

    it('should throw an Error if parent is not an CustomElementRegistry instance', async () => {
      expect(() => new CustomElementRegistry({})).to.throw();
    });

    it('should contain a cache for the local defined elements', async () => {
      const registry = new CustomElementRegistry();

      expect(registry.__tagsCache).to.not.be.undefined;
    });

    describe('define', () => {
      it('should scope defined elements', async () => {
        const registry = new CustomElementRegistry();

        registry.define('sw-alderaan', class extends HTMLElement {});

        expect(registry.__tagsCache.has('sw-alderaan')).to.be.true;
      });
    });
  });
});
