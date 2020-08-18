import { expect } from '@open-wc/testing';
import { supportsAdoptingStyleSheets } from '../src/constants.js';

import '../index.js'; // load the polyfill

if (supportsAdoptingStyleSheets) {
  describe('polyfillCSSStyleSheet', () => {
    it('should notify when `replace` method is called', async () => {
      const style = new CSSStyleSheet();

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      await style.replace('p { color: orange; }');

      const event = await promise;

      expect(event).to.be.eql({
        name: 'replace',
        args: ['p { color: orange; }'],
      });
    });

    it('should notify when `replaceSync` method is called', async () => {
      const style = new CSSStyleSheet();

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      style.replaceSync('p { color: orange; }');

      const event = await promise;

      expect(event).to.be.eql({
        name: 'replaceSync',
        args: ['p { color: orange; }'],
      });
    });

    it('should notify when `insertRule` method is called', async () => {
      const style = new CSSStyleSheet();

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      style.insertRule('p { color: orange; }', 0);

      const event = await promise;

      expect(event).to.be.eql({
        name: 'insertRule',
        args: ['p { color: orange; }', 0],
      });
    });

    it('should notify when `deleteRule` method is called', async () => {
      const style = new CSSStyleSheet();
      style.replaceSync('p { color: orange; }');

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      style.deleteRule(0);

      const event = await promise;

      expect(event).to.be.eql({
        name: 'deleteRule',
        args: [0],
      });
    });

    it('should notify when `addRule` method is called', async () => {
      const style = new CSSStyleSheet();

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      style.addRule('p', '{ color: orange; }', 0);

      const event = await promise;

      expect(event).to.be.eql({
        name: 'addRule',
        args: ['p', '{ color: orange; }', 0],
      });
    });

    it('should notify when `removeRule` method is called', async () => {
      const style = new CSSStyleSheet();
      style.replaceSync('p { color: orange; }');

      const promise = new Promise(resolve => {
        style.subscribe(event => {
          resolve(event);
        });
      });

      style.removeRule(0);

      const event = await promise;

      expect(event).to.be.eql({
        name: 'removeRule',
        args: [0],
      });
    });
  });
}
