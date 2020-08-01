/* eslint max-classes-per-file:0 */
import { expect } from '@open-wc/testing';
import { definitionsRegistry } from '../src/definitionsRegistry.js';
import { getTestTagName } from './utils.js';

import '../index.js'; // loads the polyfill

describe('definitionsRegistry', () => {
  describe('add', () => {
    it('should be able to add a new tag definition', async () => {
      const tagName = getTestTagName();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);
    });

    it('should throw an error if no tagName is provided', async () => {
      const tagName = getTestTagName();

      expect(() =>
        definitionsRegistry.add({
          originalTagName: tagName,
          constructor: class extends HTMLElement {},
          registry: new CustomElementRegistry(),
        })
      ).to.throw('"tagName" is mandatory');
    });

    it('should throw an error if no originalTagName is provided', async () => {
      const tagName = getTestTagName();

      expect(() =>
        definitionsRegistry.add({
          tagName,
          constructor: class extends HTMLElement {},
          registry: new CustomElementRegistry(),
        })
      ).to.throw('"originalTagName" is mandatory');
    });

    it('should throw an error if no registry is provided', async () => {
      const tagName = getTestTagName();

      expect(() =>
        definitionsRegistry.add({
          tagName,
          originalTagName: tagName,
          constructor: class extends HTMLElement {},
        })
      ).to.throw('"registry" is mandatory');
    });

    it('should allow to add a tagDefinition without a constructor', async () => {
      const tagName = getTestTagName();

      definitionsRegistry.add({
        tagName,
        originalTagName: tagName,
        registry: new CustomElementRegistry(),
      });
    });

    it('should thor an error if two elements are registered with the same tagName', async () => {
      const tagName = getTestTagName();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(() =>
        definitionsRegistry.add({
          ...item,
          constructor: class extends HTMLElement {},
        })
      ).to.throw(
        `the name "${tagName}" has already been used with this registry`
      );
    });

    it('should thor an error if two elements are registered with the same constructor', async () => {
      const tagName = getTestTagName();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(() =>
        definitionsRegistry.add({
          ...item,
          tagName: getTestTagName(),
        })
      ).to.throw('this constructor has already been used with this registry');
    });

    it('should allow to register elements with the same original tagName', async () => {
      const tagName = getTestTagName();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);
      definitionsRegistry.add({
        ...item,
        tagName: getTestTagName(),
        constructor: class extends HTMLElement {},
      });
    });
  });

  describe('getTagName', () => {
    it('should return a the scopedTagName associated with the specified tagName and registry', () => {
      const originalTagName = getTestTagName();
      const scopedTagName = getTestTagName();
      const registry = new CustomElementRegistry();

      definitionsRegistry.add({
        tagName: scopedTagName,
        originalTagName,
        constructor: class extends HTMLElement {},
        registry,
      });

      expect(
        definitionsRegistry.getTagName(originalTagName, registry)
      ).to.be.equal(scopedTagName);
    });

    it('should return a new scopedTagName if no originalTagName is found and is not the global registry', async () => {
      const originalTagName = getTestTagName();

      const scopedTagName = definitionsRegistry.getTagName(
        originalTagName,
        new CustomElementRegistry()
      );

      expect(scopedTagName).to.not.be.undefined;
      expect(scopedTagName).to.not.be.equal(originalTagName);
    });

    it('should return originalTagName if no originalTagName is found and is the global registry', async () => {
      const originalTagName = getTestTagName();

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
      const tagName = getTestTagName();
      const item = {
        tagName,
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
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
      const tagName = getTestTagName();
      definitionsRegistry.add({
        tagName: getTestTagName(),
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      });
      definitionsRegistry.add({
        tagName: getTestTagName(),
        originalTagName: tagName,
        constructor: class extends HTMLElement {},
        registry: new CustomElementRegistry(),
      });

      expect(
        definitionsRegistry.findByOriginalTagName(tagName).length
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
      const tagName = getTestTagName();
      const constructor = class extends HTMLElement {};
      const item = {
        tagName,
        originalTagName: tagName,
        constructor,
        registry: new CustomElementRegistry(),
      };

      definitionsRegistry.add(item);

      expect(definitionsRegistry.findByConstructor(constructor)).to.be.eql(
        item
      );
    });

    it('should return undefined if an element is not found', async () => {
      expect(
        definitionsRegistry.findByConstructor(class extends HTMLElement {})
      ).to.be.undefined;
    });
  });

  describe('findByRegistry', () => {
    it('should return a list of elements with the same originalTagName', async () => {
      const registry = new CustomElementRegistry();

      definitionsRegistry.add({
        tagName: getTestTagName(),
        originalTagName: getTestTagName(),
        constructor: class extends HTMLElement {},
        registry,
      });
      definitionsRegistry.add({
        tagName: getTestTagName(),
        originalTagName: getTestTagName(),
        constructor: class extends HTMLElement {},
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
