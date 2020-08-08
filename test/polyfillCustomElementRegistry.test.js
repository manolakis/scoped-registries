/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect, nextFrame } from '@open-wc/testing';
import { getTestTagName, getTestElement } from './utils.js';

import '../index.js'; // loads the polyfill

describe('polyfillCustomElementRegistry', () => {
  describe('Global Custom Element Registry', () => {
    describe('define', () => {
      it('should return the same defined constructor', async () => {
        const { tagName, Element } = getTestElement();
        const ReturnedClass = customElements.define(tagName, Element);

        expect(ReturnedClass).to.be.equal(Element);
      });

      it('should not scope defined elements', async () => {
        const { tagName, Element } = getTestElement();
        customElements.define(tagName, Element);

        const $el = new Element();

        expect($el.tagName.toLowerCase()).to.be.equal(tagName);
      });
    });

    describe('get', () => {
      it('should return the constructor defined for a tag name', () => {
        const { tagName, Element } = getTestElement();
        customElements.define(tagName, Element);

        expect(customElements.get(tagName)).to.be.equal(Element);
      });

      it('should return undefined if there is no constructor defined for a tag name', async () => {
        expect(customElements.get(getTestTagName())).to.be.undefined;
      });
    });

    describe('getRegistry', () => {
      it('should return itself if it contains the defined tag name', async () => {
        const { tagName, Element } = getTestElement();
        customElements.define(tagName, Element);

        expect(customElements.getRegistry(tagName)).to.be.equal(customElements);
      });
    });

    describe('whenDefined', () => {
      it('should return a fulfilled promise if element is already defined', async () => {
        const { tagName, Element } = getTestElement();
        customElements.define(tagName, Element);

        let isFulfilled = false;

        customElements.whenDefined(tagName).then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });

      it('should return a promise and fulfill it when element is defined', async () => {
        const { tagName, Element } = getTestElement();
        let isFulfilled = false;

        customElements.whenDefined(tagName).then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.false;

        customElements.define(tagName, Element);

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });
    });

    describe('getDefinitions', () => {
      it('should return all the registry registrations', async () => {
        const { tagName: tagName1, Element: Element1 } = getTestElement();
        const { tagName: tagName2, Element: Element2 } = getTestElement();

        customElements.define(tagName1, Element1);
        customElements.define(tagName2, Element2);

        const definitions = customElements.getDefinitions();

        // as customElements is a global registry it probably contains much more defined elements, so for testing
        // purposes we are going to delete those ones not created in this test case.
        const allowedKeys = [tagName1, tagName2];
        Object.keys(definitions).forEach(key => {
          if (!allowedKeys.includes(key)) {
            delete definitions[key];
          }
        });

        expect(definitions).to.be.eql({
          [tagName1]: Element1,
          [tagName2]: Element2,
        });
      });
    });
  });

  describe('Scoped Custom Element Registry', () => {
    it('should be able to be instantiated', async () => {
      const registry = new CustomElementRegistry();

      expect(registry).to.not.be.undefined;
    });

    it('should be able to be instantiated with a parent reference', async () => {
      const registry = new CustomElementRegistry({ parent: customElements });
      const registry2 = new CustomElementRegistry({ parent: registry });

      expect(registry).to.not.be.undefined;
      expect(registry2).to.not.be.undefined;
    });

    it('should throw an Error if parent is not an CustomElementRegistry instance', async () => {
      expect(() => new CustomElementRegistry({ parent: {} })).to.throw();
    });

    describe('define', () => {
      it('should return a trivial subclass of the registered class', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();

        const NewElement = registry.define(tagName, Element);

        expect(NewElement).to.not.be.equal(Element);
        expect(Object.getPrototypeOf(NewElement)).to.be.equal(Element);
      });

      it('should scope defined elements', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();

        const NewElement = registry.define(tagName, Element);

        const $el = new NewElement();

        expect($el.tagName.toLowerCase()).to.be.equal(tagName);
      });
    });

    describe('get', () => {
      it('should return a subclass of the constructor defined for a tag name', () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();

        registry.define(tagName, Element);

        expect(Object.getPrototypeOf(registry.get(tagName))).to.be.equal(
          Element
        );
      });

      it('should return undefined if there is no constructor defined for a tag name', async () => {
        const registry = new CustomElementRegistry();

        expect(registry.get(getTestTagName())).to.be.undefined;
      });

      it('should return the closest constructor defined for a tag name in the chain of registries', async () => {
        const { tagName: tagName1, Element: Element1 } = getTestElement();
        const { tagName: tagName2, Element: Element2 } = getTestElement();
        const registry = new CustomElementRegistry({
          parent: customElements,
          definitions: { [tagName1]: Element1 },
        });
        const registry2 = new CustomElementRegistry({
          parent: registry,
          definitions: { [tagName2]: Element2 },
        });

        expect(Object.getPrototypeOf(registry2.get(tagName1))).to.be.equal(
          Element1
        );
        expect(Object.getPrototypeOf(registry2.get(tagName2))).to.be.equal(
          Element2
        );
      });

      it('should return undefined if there is no constructor defined for a tag name in the chain of registries', async () => {
        const registry = new CustomElementRegistry({ parent: customElements });
        const registry2 = new CustomElementRegistry({ parent: registry });

        expect(registry2.get(getTestTagName())).to.be.undefined;
      });
    });

    describe('getRegistry', () => {
      it('should return the closest registry in which a tag name is defined', async () => {
        // TODO
      });
    });

    describe('whenDefined', () => {
      it('should return a fulfilled promise if element is already defined', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();

        registry.define(tagName, Element);

        let isFulfilled = false;

        registry.whenDefined(tagName).then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });

      it('should return a promise and fulfill it when element is defined', async () => {
        const { tagName, Element } = getTestElement();
        const registry = new CustomElementRegistry();
        let isFulfilled = false;

        registry.whenDefined(tagName).then(() => {
          isFulfilled = true;
        });

        await nextFrame();

        expect(isFulfilled).to.be.false;

        registry.define(tagName, Element);

        await nextFrame();

        expect(isFulfilled).to.be.true;
      });
    });

    describe('bulk definitions', () => {
      it('should allow sugar for bulk definitions', async () => {
        const { tagName: tagName1, Element: Element1 } = getTestElement();
        const { tagName: tagName2, Element: Element2 } = getTestElement();
        const registry = new CustomElementRegistry({
          definitions: {
            [tagName1]: Element1,
            [tagName2]: Element2,
          },
        });

        expect(Object.getPrototypeOf(registry.get(tagName1))).to.be.equal(
          Element1
        );
        expect(Object.getPrototypeOf(registry.get(tagName2))).to.be.equal(
          Element2
        );
      });
    });

    describe('getDefinitions', () => {
      it('should return all the registry registrations', async () => {
        const { tagName: tagName1, Element: Element1 } = getTestElement();
        const { tagName: tagName2, Element: Element2 } = getTestElement();
        const registry = new CustomElementRegistry({
          definitions: {
            [tagName1]: Element1,
            [tagName2]: Element2,
          },
        });

        const definitions = registry.getDefinitions();

        expect(definitions).to.be.eql({
          [tagName1]: registry.get(tagName1),
          [tagName2]: registry.get(tagName2),
        });
      });
    });
  });

  it('should allow custom elements constructors registered in the global registry', async () => {
    const { tagName, Element } = getTestElement();
    customElements.define(tagName, Element);

    const $el = new Element();

    expect($el).to.be.instanceof(Element);
  });

  it('should not allow custom elements constructors registered in a custom registry', async () => {
    const { tagName, Element } = getTestElement();
    const registry = new CustomElementRegistry();

    registry.define(tagName, Element);

    expect(() => new Element()).to.throw();
  });

  it('should allow custom elements constructors returned by get() or define() in custom registries', async () => {
    const { tagName, Element } = getTestElement();
    const registry = new CustomElementRegistry();
    const NewElement = registry.define(tagName, Element);

    const $el = new NewElement();

    expect($el).to.be.instanceof(Element);
    expect($el).to.be.instanceof(NewElement);
  });
});
