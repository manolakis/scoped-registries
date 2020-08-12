/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';

import '../index.js'; // loads the polyfill

describe('polyfillDocument', () => {
  it('should define the scope of the created elements', async () => {
    const $div = document.createElement('div');

    expect($div.scope).to.be.equal(document);
  });
});
