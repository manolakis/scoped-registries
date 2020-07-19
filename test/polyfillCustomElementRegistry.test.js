/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect, nextFrame } from '@open-wc/testing';
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

    describe('get', () => {
      it('should return the constructor defined for a tag name', () => {
        class Anoat extends HTMLElement {}

        customElements.define('sw-anoat', Anoat);

        expect(customElements.get('sw-anoat')).to.be.equal(Anoat);
      });

      it('should return undefined if there is no constructor defined for a tag name', async () => {
        expect(customElements.get('sw-unknown')).to.be.undefined;
      });
    });

    describe('getRegistry', () => {
      it('should return itself if it contains the defined tag name', async () => {
        class CatoNeimoidia extends HTMLElement {}

        customElements.define('sw-cato-neimoidia', CatoNeimoidia);

        expect(customElements.getRegistry('sw-cato-neimoidia')).to.be.equal(
          customElements
        );
      });
    });

    describe('whenDefined', () => {
      it('should return a fulfilled promise if element is already defined', async () => {
        customElements.define('sw-christophsis', class extends HTMLElement {});

        let isFulfilled = false;

        customElements.whenDefined('sw-christophsis').then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });

      it('should return a promise and fulfill it when element is defined', async () => {
        let isFulfilled = false;

        customElements.whenDefined('sw-corellia').then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.false;

        customElements.define('sw-corellia', class extends HTMLElement {});

        await nextFrame();

        expect(isFulfilled).to.be.true;
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

    describe('get', () => {
      it('should return the constructor defined for a tag name', () => {
        class Atollon extends HTMLElement {}
        const registry = new CustomElementRegistry();

        registry.define('sw-atollon', Atollon);

        expect(new (registry.get('sw-atollon'))()).to.be.instanceof(Atollon);
      });

      it('should return undefined if there is no constructor defined for a tag name', async () => {
        const registry = new CustomElementRegistry();

        expect(registry.get('sw-unknown')).to.be.undefined;
      });

      it('should return the closest constructor defined for a tag name in the chain of registries', async () => {
        class Bespin extends HTMLElement {}
        class BaseStarkiller extends HTMLElement {}
        const registry = new CustomElementRegistry(customElements);
        const registry2 = new CustomElementRegistry(registry);

        customElements.define('sw-bespin', Bespin);
        registry.define('sw-base-starkiller', BaseStarkiller);

        expect(new (registry2.get('sw-bespin'))()).to.be.instanceof(Bespin);
        expect(new (registry2.get('sw-base-starkiller'))()).to.be.instanceof(
          BaseStarkiller
        );
      });

      it('should return undefined if there is no constructor defined for a tag name in the chain of registries', async () => {
        const registry = new CustomElementRegistry(customElements);
        const registry2 = new CustomElementRegistry(registry);

        expect(registry2.get('sw-unknown')).to.be.undefined;
      });
    });

    describe('getRegistry', () => {
      it('should return the closest registry in which a tag name is defined', async () => {});
    });

    describe('whenDefined', () => {
      it('should return a fulfilled promise if element is already defined', async () => {
        const registry = new CustomElementRegistry();

        registry.define('sw-concord-dawn', class extends HTMLElement {});

        let isFulfilled = false;

        registry.whenDefined('sw-concord-dawn').then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });

      it('should return a promise and fulfill it when element is defined', async () => {
        const registry = new CustomElementRegistry();
        let isFulfilled = false;

        registry.whenDefined('sw-coruscant').then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.false;

        registry.define('sw-coruscant', class extends HTMLElement {});

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });
    });
  });
});
