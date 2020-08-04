/* eslint max-classes-per-file:0 */
import { expect } from '@open-wc/testing';
import { definitionsRegistry } from '../src/definitionsRegistry.js';
import { getTestTagName, getTestElement } from './utils.js';

import '../index.js'; // loads the polyfill

describe('definitionsRegistry', () => {
  describe('add', () => {
    it('should be able to add a new tag definition', async () => {
      const { tagName, Element } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);
    });

    it('should throw an error if no tagName is provided', async () => {
      const { tagName, Element } = getTestElement();

      expect(() =>
        definitionsRegistry.add({
          originalTagName: tagName,
          constructor: Element,
          registry: new CustomElementRegistry(),
        })
      ).to.throw('"tagName" is mandatory');
    });

    it('should throw an error if no originalTagName is provided', async () => {
      const { tagName, Element } = getTestElement();

      expect(() =>
        definitionsRegistry.add({
          tagName,
          constructor: Element,
          registry: new CustomElementRegistry(),
        })
      ).to.throw('"originalTagName" is mandatory');
    });

    it('should throw an error if no registry is provided', async () => {
      const { tagName, Element } = getTestElement();

      expect(() =>
        definitionsRegistry.add({
          tagName,
          originalTagName: tagName,
          constructor: Element,
        })
      ).to.throw('"registry" is mandatory');
    });

    it('should allow to add a tagDefinition without a constructor', async () => {
      const { tagName } = getTestElement();

      definitionsRegistry.add({
        tagName,
        originalTagName: tagName,
        registry: new CustomElementRegistry(),
      });
    });

    it('should thor an error if two elements are registered with the same tagName', async () => {
      const { tagName, Element } = getTestElement();
      const { Element: Element2 } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(() =>
        definitionsRegistry.add({
          ...item,
          constructor: Element2,
        })
      ).to.throw(
        `the name "${tagName}" has already been used with this registry`
      );
    });

    it('should thor an error if two elements are registered with the same constructor', async () => {
      const { tagName, Element } = getTestElement();
      const { tagName: tagName2 } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(() =>
        definitionsRegistry.add({
          ...item,
          tagName: tagName2,
        })
      ).to.throw('this constructor has already been used with this registry');
    });

    it('should allow to register elements with the same original tagName', async () => {
      const { tagName, Element } = getTestElement();
      const { tagName: tagName2, Element: Element2 } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);
      definitionsRegistry.add({
        ...item,
        tagName: tagName2,
        constructor: Element2,
      });
    });
  });

  describe('getTagName', () => {
    it('should return a the scopedTagName associated with the specified tagName and registry', () => {
      const { tagName: originalTagName, Element } = getTestElement();
      const { tagName: scopedTagName } = getTestElement();
      const registry = new CustomElementRegistry();

      definitionsRegistry.add({
        tagName: scopedTagName,
        originalTagName,
        constructor: Element,
        registry,
      });

      expect(
        definitionsRegistry.getTagName(originalTagName, registry)
      ).to.be.equal(scopedTagName);
    });

    it('should return a new scopedTagName if no originalTagName is found and is not the global registry', async () => {
      const { tagName: originalTagName } = getTestElement();

      const scopedTagName = definitionsRegistry.getTagName(
        originalTagName,
        new CustomElementRegistry()
      );

      expect(scopedTagName).to.not.be.undefined;
      expect(scopedTagName).to.not.be.equal(originalTagName);
    });

    it('should return originalTagName if no originalTagName is found and is the global registry', async () => {
      const { tagName: originalTagName } = getTestElement();

      const scopedTagName = definitionsRegistry.getTagName(
        originalTagName,
        customElements
      );

      expect(scopedTagName).to.not.be.undefined;
      expect(scopedTagName).to.be.equal(originalTagName);
    });
  });

  describe('findByTagName', () => {
    it('should find an existing element by its tagName', async () => {
      const { tagName, Element } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(definitionsRegistry.findByTagName(tagName)).to.be.eql(item);
    });

    it('should return undefined if an element is not found', async () => {
      expect(definitionsRegistry.findByTagName(getTestTagName())).to.be
        .undefined;
    });
  });

  describe('findByOriginalTagName', () => {
    it('should return a list of elements with the same originalTagName', async () => {
      const { tagName: originalTagName } = getTestElement();
      const { tagName: tagName1, Element: Element1 } = getTestElement();
      const { tagName: tagName2, Element: Element2 } = getTestElement();
      definitionsRegistry.add({
        tagName: tagName1,
        originalTagName,
        constructor: Element1,
        registry: new CustomElementRegistry(),
      });
      definitionsRegistry.add({
        tagName: tagName2,
        originalTagName,
        constructor: Element2,
        registry: new CustomElementRegistry(),
      });

      expect(
        definitionsRegistry.findByOriginalTagName(originalTagName).length
      ).to.be.equal(2);
    });

    it('should return an empty list if no elements are found', async () => {
      expect(
        definitionsRegistry.findByOriginalTagName(getTestTagName())
      ).to.be.eql([]);
    });
  });

  describe('findByConstructor', () => {
    it('should find an existing element by its constructor', async () => {
      const { tagName, Element } = getTestElement();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: Element,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(definitionsRegistry.findByConstructor(Element)).to.be.eql(item);
    });

    it('should return undefined if an element is not found', async () => {
      const { Element } = getTestElement();

      expect(definitionsRegistry.findByConstructor(Element)).to.be.undefined;
    });
  });

  describe('findByRegistry', () => {
    it('should return a list of elements with the same originalTagName', async () => {
      const registry = new CustomElementRegistry();
      const { tagName: tagName1, Element: Element1 } = getTestElement();
      const { tagName: tagName2, Element: Element2 } = getTestElement();

      definitionsRegistry.add({
        tagName: tagName1,
        originalTagName: getTestTagName(),
        constructor: Element1,
        registry,
      });
      definitionsRegistry.add({
        tagName: tagName2,
        originalTagName: getTestTagName(),
        constructor: Element2,
        registry,
      });

      expect(definitionsRegistry.findByRegistry(registry).length).to.be.equal(
        2
      );
    });

    it('should return an empty list if no elements are found', async () => {
      expect(
        definitionsRegistry.findByRegistry(new CustomElementRegistry())
      ).to.be.eql([]);
    });
  });
});
