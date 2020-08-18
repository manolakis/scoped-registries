/* eslint max-classes-per-file:0, no-global-assign:0 */
import { expect } from '@open-wc/testing';
import {
  getTestTagName,
  getTestElement,
  getScopedShadowRoot,
  createTemplateElement,
  wrapHTML,
} from './utils.js';
import { supportsAdoptingStyleSheets } from '../src/constants.js'; // loads the polyfill

import '../index.js';

describe('polyfillShadowRoot', () => {
  describe('DOM', () => {
    describe('global registry', () => {
      describe('createElement', () => {
        it('should create a scoped custom element', async () => {
          const tagName = getTestTagName();
          const shadowRoot = getScopedShadowRoot();

          const $el = shadowRoot.createElement(tagName);

          expect($el.tagName.toLowerCase()).to.be.equal(tagName);
          expect($el.outerHTML).to.equal(`<${tagName}></${tagName}>`);
        });

        it('should create a regular element', async () => {
          const tagName = 'div';
          const shadowRoot = getScopedShadowRoot();

          const $el = shadowRoot.createElement(tagName);

          expect($el.tagName.toLowerCase()).to.equal(tagName);
          expect($el.outerHTML).to.equal(`<div></div>`);
        });
      });

      describe('importNode', () => {
        describe('deep = false', () => {
          it('should import a basic node', async () => {
            const shadowRoot = getScopedShadowRoot();
            const $div = document.createElement('div');

            const $clone = shadowRoot.importNode($div, false);

            expect($clone.outerHTML).to.be.equal('<div></div>');
          });

          it('should import a basic template content', async () => {
            const shadowRoot = getScopedShadowRoot();
            const $template = createTemplateElement('<div></div>');

            const $clone = shadowRoot.importNode($template.content, false);

            expect($clone).to.be.instanceof(DocumentFragment);
            expect($clone.childNodes.length).to.be.equal(0);
          });
        });

        describe('deep = true', () => {
          it('should import a basic node', async () => {
            const shadowRoot = await getScopedShadowRoot();
            const $div = document.createElement('div');

            const $clone = shadowRoot.importNode($div, true);

            expect($clone.outerHTML).to.be.equal('<div></div>');
          });

          it('should import a basic template', async () => {
            const shadowRoot = getScopedShadowRoot();
            const $template = createTemplateElement('<div></div>');

            const $clone = shadowRoot.importNode($template.content, true);

            expect($clone).to.be.instanceof(DocumentFragment);
            expect($clone.childNodes.length).to.be.equal(1);
            expect($clone.firstElementChild.outerHTML).to.be.equal(
              '<div></div>'
            );
          });

          it('should import a complex template', async () => {
            const shadowRoot = getScopedShadowRoot();
            const html = '<div><span>sample</span></div><span></span>';
            const $template = createTemplateElement(html);

            const $clone = shadowRoot.importNode($template.content, true);

            expect($clone).to.be.instanceof(DocumentFragment);
            expect($clone.childNodes.length).to.be.equal(2);
            expect($clone.firstElementChild.outerHTML).to.be.equal(
              '<div><span>sample</span></div>'
            );
          });
        });
      });

      describe('innerHTML', () => {
        it('should not scope the custom elements', async () => {
          const shadowRoot = getScopedShadowRoot();

          shadowRoot.innerHTML = '<my-tag><span>data</span></my-tag>';

          expect(shadowRoot.innerHTML).to.equal(
            '<my-tag><span>data</span></my-tag>'
          );
        });
      });
    });

    describe('scoped registry', () => {
      describe('createElement', () => {
        it('should create a scoped custom element', async () => {
          const tagName = getTestTagName();
          const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

          const $el = shadowRoot.createElement(tagName);

          expect($el.tagName.toLowerCase()).to.be.equal(tagName);
          expect($el.outerHTML).to.match(
            new RegExp(`<${tagName}-\\d{1,5}></${tagName}-\\d{1,5}>`)
          );
        });

        it('should create a regular element', async () => {
          const tagName = 'div';
          const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

          const $el = shadowRoot.createElement(tagName);

          expect($el.tagName.toLowerCase()).to.equal(tagName);
          expect($el.outerHTML).to.be.equal('<div></div>');
        });

        it('should set the shadowRoot as the scope of regular elements', async () => {
          const tagName = 'div';
          const shadowRoot = getScopedShadowRoot(new CustomElementRegistry());

          const $el = shadowRoot.createElement(tagName);

          expect($el.scope).to.equal(shadowRoot);
        });
      });

      describe('importNode', () => {
        describe('deep = true', () => {
          it('should import a node tree', async () => {
            const registry = new CustomElementRegistry();
            const shadowRoot = getScopedShadowRoot(registry);
            const html = '<span>sample</span>';
            const $div = wrapHTML(html);

            const $clone = shadowRoot.importNode($div, true);

            expect($clone.innerHTML).to.be.equal(html);
          });

          it('should import a node tree with an upgraded custom element', async () => {
            const { tagName, Element } = getTestElement();
            customElements.define(tagName, Element);

            const registry = new CustomElementRegistry();
            const shadowRoot = getScopedShadowRoot(registry);
            const $div = wrapHTML(
              `<${tagName}><span>data</span></${tagName}>`,
              document
            );

            const $clone = shadowRoot.importNode($div, true);

            expect($clone.innerHTML).to.be.equal(
              `<${tagName}><span>data</span></${tagName}>`
            );
          });

          it('should import a node tree with an upgraded custom element from another shadowRoot', async () => {
            const { tagName, Element } = getTestElement();
            const registry1 = new CustomElementRegistry();
            registry1.define(tagName, Element);
            const shadowRoot1 = getScopedShadowRoot(registry1);
            const $div = wrapHTML(
              `<${tagName}><span>data</span></${tagName}>`,
              shadowRoot1
            );
            const registry2 = new CustomElementRegistry();
            const shadowRoot2 = getScopedShadowRoot(registry2);

            const $clone = shadowRoot2.importNode($div, true);

            expect($clone.innerHTML).to.be.equal($div.innerHTML);
          });

          it('should import a node tree with a non upgraded custom element', async () => {
            const tagName = getTestTagName();
            const registry = new CustomElementRegistry();
            const shadowRoot = getScopedShadowRoot(registry);
            const $div = wrapHTML(`<${tagName}><span>data</span></${tagName}>`);

            const $clone = shadowRoot.importNode($div, true);

            expect($clone.innerHTML).to.match(
              new RegExp(
                `<${tagName}-\\d{1,5}><span>data</span></${tagName}-\\d{1,5}>`
              )
            );
          });

          it('should import a node tree with a non upgraded custom element defined in the registry', async () => {
            const { tagName, Element } = getTestElement();
            const registry = new CustomElementRegistry();
            registry.define(tagName, Element);
            const shadowRoot = getScopedShadowRoot(registry);
            const $div = wrapHTML(`<${tagName}><span>data</span></${tagName}>`);

            const $clone = shadowRoot.importNode($div, true);

            expect($clone.innerHTML).to.match(
              new RegExp(
                `<${tagName}-\\d{1,5}><span>data</span></${tagName}-\\d{1,5}>`
              )
            );
            expect($clone.firstElementChild).instanceof(Element);
          });

          it('should import a node tree with an non upgraded custom element from another shadowRoot', async () => {
            const { tagName } = getTestElement();
            const registry1 = new CustomElementRegistry();
            const shadowRoot1 = getScopedShadowRoot(registry1);
            const $div = wrapHTML(
              `<${tagName}><span>data</span></${tagName}>`,
              shadowRoot1
            );
            const registry2 = new CustomElementRegistry();
            const shadowRoot2 = getScopedShadowRoot(registry2);

            const $clone = shadowRoot2.importNode($div, true);

            expect($div.firstElementChild.scope).to.be.equal(shadowRoot1);
            expect($clone.firstElementChild.scope).to.be.equal(shadowRoot2);
            expect($clone.innerHTML).to.not.be.equal($div.innerHTML);
            expect($clone.innerHTML).to.match(
              new RegExp(
                `<${tagName}-\\d{1,5}><span>data</span></${tagName}-\\d{1,5}>`
              )
            );
          });

          it('should import a template with an upgraded custom element', async () => {
            const { tagName, Element } = getTestElement();
            customElements.define(tagName, Element);

            const registry = new CustomElementRegistry();
            const shadowRoot = getScopedShadowRoot(registry);
            const $template = createTemplateElement(
              `<${tagName}><span>data</span></${tagName}>`
            );

            const $clone = shadowRoot.importNode($template.content, true);

            expect($clone).to.be.instanceof(DocumentFragment);
            expect($clone.childNodes.length).to.be.equal(1);
            expect($clone.firstElementChild.outerHTML).to.match(
              new RegExp(
                `<${tagName}-\\d{1,5}><span>data</span></${tagName}-\\d{1,5}>`
              )
            );
          });

          it('should import a template with a non upgraded custom element', async () => {
            const { tagName } = getTestElement();
            const registry = new CustomElementRegistry();
            const shadowRoot = getScopedShadowRoot(registry);
            const $template = createTemplateElement(
              `<${tagName}><span>data</span></${tagName}>`
            );

            const $clone = shadowRoot.importNode($template.content, true);

            expect($clone).to.be.instanceof(DocumentFragment);
            expect($clone.childNodes.length).to.be.equal(1);
            expect($clone.firstElementChild.outerHTML).to.match(
              new RegExp(
                `<${tagName}-\\d{1,5}><span>data</span></${tagName}-\\d{1,5}>`
              )
            );
          });
        });
      });

      describe('innerHTML', () => {
        it('should scope the custom elements', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);

          shadowRoot.innerHTML = '<my-tag><span>data</span></my-tag>';

          expect(shadowRoot.innerHTML).to.match(
            new RegExp(`<my-tag-\\d{1,5}><span>data</span></my-tag-\\d{1,5}>`)
          );
        });

        it('should scope scoped elements from another shadow root', async () => {
          const registry1 = new CustomElementRegistry();
          const shadowRoot1 = getScopedShadowRoot(registry1);
          shadowRoot1.innerHTML = '<my-tag><span>data</span></my-tag>';
          const registry2 = new CustomElementRegistry();
          const shadowRoot2 = getScopedShadowRoot(registry2);

          shadowRoot2.innerHTML = shadowRoot1.innerHTML;

          expect(shadowRoot1.innerHTML).to.match(
            new RegExp(`<my-tag-\\d{1,5}><span>data</span></my-tag-\\d{1,5}>`)
          );
          expect(shadowRoot2.innerHTML).to.match(
            new RegExp(`<my-tag-\\d{1,5}><span>data</span></my-tag-\\d{1,5}>`)
          );
          expect(shadowRoot1.innerHTML).to.not.be.equal(shadowRoot2.innerHTML);
        });
      });

      describe('querySelector', () => {
        it('should be able to find a normal element with the global registry', async () => {
          const shadowRoot = getScopedShadowRoot();
          shadowRoot.innerHTML = `<div></div>`;

          const $el = shadowRoot.querySelector('div');

          expect($el).to.not.be.null;
          expect($el.tagName.toLowerCase()).to.be.equal('div');
        });

        it('should be able to find a custom element in a shadow root with the global registry', async () => {
          const shadowRoot = getScopedShadowRoot();
          const tagName = getTestTagName();
          shadowRoot.innerHTML = `<${tagName}></${tagName}>`;

          const $el = shadowRoot.querySelector(tagName);

          expect($el).to.not.be.null;
          expect($el.tagName.toLowerCase()).to.be.equal(tagName);
        });

        it('should be able to find a custom element in a shadow root and a custom registry', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const tagName = getTestTagName();
          shadowRoot.innerHTML = `<div id="myDiv"><${tagName} class="sample"></${tagName}></div>`;

          const $el = shadowRoot.querySelector(`#myDiv ${tagName}.sample`);

          expect($el).to.not.be.null;
          expect($el.tagName.toLowerCase()).to.be.equal(tagName);
        });
      });

      describe('querySelectorAll', () => {
        it('should be able to find a list of normal elements', async () => {
          const shadowRoot = getScopedShadowRoot();

          shadowRoot.innerHTML = `
            <div>
              <span></span>
              <span></span>
            </div>
          `;

          const items = shadowRoot.querySelectorAll('span');

          expect(items.length).to.be.equal(2);
          expect(items[0].tagName.toLowerCase()).to.be.equal('span');
          expect(items[1].tagName.toLowerCase()).to.be.equal('span');
        });

        it('should be able to find a list of scoped elements with the global registry', async () => {
          const shadowRoot = getScopedShadowRoot();
          const tagName = getTestTagName();

          shadowRoot.innerHTML = `
        <div>
          <${tagName}></${tagName}>
          <${tagName}></${tagName}>
        </div>
      `;

          const items = shadowRoot.querySelectorAll(tagName);

          expect(items.length).to.be.equal(2);
          expect(items[0].tagName.toLowerCase()).to.be.equal(tagName);
          expect(items[1].tagName.toLowerCase()).to.be.equal(tagName);
        });

        it('should be able to find a list of custom elements with a custom registry', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const tagName = getTestTagName();

          shadowRoot.innerHTML = `
        <div>
          <${tagName}></${tagName}>
          <${tagName}></${tagName}>
        </div>
      `;

          const items = shadowRoot.querySelectorAll(tagName);

          expect(items.length).to.be.equal(2);
          expect(items[0].tagName.toLowerCase()).to.be.equal(tagName);
          expect(items[1].tagName.toLowerCase()).to.be.equal(tagName);
        });
      });
    });

    describe('appendChild', () => {
      describe('with global registry', () => {
        it('should not scope custom elements', async () => {
          const shadowRoot = getScopedShadowRoot();
          const $html = wrapHTML(`<my-elem></my-elem>`);

          shadowRoot.appendChild($html);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.be.equal('<my-elem></my-elem>');
        });
      });

      describe('with scoped registry', () => {
        it('should scope non upgraded custom elements', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const $html = wrapHTML(`<my-elem></my-elem>`);

          shadowRoot.appendChild($html);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.match(
            new RegExp(`<my-elem-\\d{1,5}></my-elem-\\d{1,5}>`)
          );
        });

        it('should not scope upgraded custom elements', async () => {
          const { tagName, Element } = getTestElement();
          customElements.define(tagName, Element);

          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const $html = wrapHTML(`<${tagName}></${tagName}>`);

          shadowRoot.appendChild($html);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.be.equal(`<${tagName}></${tagName}>`);
        });
      });
    });

    describe('insertBefore', () => {
      describe('with global registry', () => {
        it('should not scope custom elements', async () => {
          const $html = wrapHTML(`<my-elem></my-elem>`);
          const shadowRoot = getScopedShadowRoot();
          shadowRoot.innerHTML = '<!-- comment -->';

          shadowRoot.insertBefore($html, shadowRoot.firstElementChild);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.be.equal('<my-elem></my-elem>');
        });
      });

      describe('with scoped registry', () => {
        it('should scope non upgraded custom elements', async () => {
          const $html = wrapHTML(`<my-elem></my-elem>`);
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          shadowRoot.innerHTML = '<!-- comment -->';

          shadowRoot.insertBefore($html, shadowRoot.firstElementChild);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.match(
            new RegExp(`<my-elem-\\d{1,5}></my-elem-\\d{1,5}>`)
          );
        });

        it('should not scope upgraded custom elements', async () => {
          const { tagName, Element } = getTestElement();
          customElements.define(tagName, Element);

          const $html = wrapHTML(`<${tagName}></${tagName}>`);
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          shadowRoot.innerHTML = '<!-- comment -->';

          shadowRoot.insertBefore($html, shadowRoot.firstElementChild);

          const [myElem] = shadowRoot.firstElementChild.children;

          expect(myElem.outerHTML).to.be.equal(`<${tagName}></${tagName}>`);
        });
      });
    });
  });

  describe('styles', () => {
    describe('importNode', () => {
      it('should not scope regular tag selectors', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<style> p { color: red; } </style>';
        const $div = wrapHTML(html);

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.innerHTML).to.be.equal(html);
      });

      it('should not scope regular tag selectors from templates', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<style> p { color: red; } </style>';
        const $template = createTemplateElement(html);

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone.firstElementChild.outerHTML).to.be.equal(html);
      });

      it('should scope custom tag selectors', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<style> my-tag { color: red; } </style>';
        const $div = wrapHTML(html);

        const $clone = shadowRoot.importNode($div, true);

        expect($clone.innerHTML).to.match(
          new RegExp(`<style> my-tag-\\d{1,5} { color: red; } </style>`)
        );
      });

      it('should scope custom tag selectors from template', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<style> my-tag { color: red; } </style>';
        const $template = createTemplateElement(html);

        const $clone = shadowRoot.importNode($template.content, true);

        expect($clone.firstElementChild.outerHTML).to.match(
          new RegExp(`<style> my-tag-\\d{1,5} { color: red; } </style>`)
        );
      });

      it('should re-scope custom tag selectors from another shadowRoot', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);
        const html = '<style> my-tag { color: red; } </style>';
        const $template = createTemplateElement(html);
        const $clone = shadowRoot.importNode($template.content, true);
        const registry2 = new CustomElementRegistry();
        const shadowRoot2 = getScopedShadowRoot(registry2);

        const $clone2 = shadowRoot2.importNode($clone, true);

        expect($clone.firstElementChild.outerHTML).to.match(
          new RegExp(`<style> my-tag-\\d{1,5} { color: red; } </style>`)
        );
        expect($clone2.firstElementChild.outerHTML).to.match(
          new RegExp(`<style> my-tag-\\d{1,5} { color: red; } </style>`)
        );
        expect($clone.firstElementChild.outerHTML).to.not.be.equal(
          $clone2.firstElementChild.outerHTML
        );
      });
    });

    describe('innerHTML', () => {
      it('should not scope regular tag selectors', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);

        shadowRoot.innerHTML = '<style> p { color: red; } </style>';

        expect(shadowRoot.innerHTML).to.be.equal(
          `<style> p { color: red; } </style>`
        );
      });

      it('should scope custom tag selectors', async () => {
        const registry = new CustomElementRegistry();
        const shadowRoot = getScopedShadowRoot(registry);

        shadowRoot.innerHTML = '<style> my-tag { color: red; } </style>';

        expect(shadowRoot.innerHTML).to.match(
          new RegExp(`<style> my-tag-\\d{1,5} { color: red; } </style>`)
        );
      });
    });

    if (supportsAdoptingStyleSheets) {
      describe('CSSStyleSheet', () => {
        it('should scope the adopted style sheets', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: red; }`)
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `replace`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          await styleSheet.replace('my-tag { color: blue; }');

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: blue; }`)
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `replaceSync`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          await styleSheet.replaceSync('my-tag { color: blue; }');

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: blue; }`)
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `addRule`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('p { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          await styleSheet.addRule('my-tag', 'color: blue', 0);

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: blue; }`)
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `removeRule`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; } p { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: red; }`)
          );

          await styleSheet.removeRule(0);

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.equal(
            'p { color: red; }'
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `insertRule`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('p { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          await styleSheet.insertRule('my-tag { color: blue; }', 0);

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: blue; }`)
          );
        });

        it('should update the scoped styles when the CSSStyleSheet is updated through `deleteRule`', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; } p { color: red; }');

          shadowRoot.adoptedStyleSheets = [styleSheet];

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.match(
            new RegExp(`my-tag-\\d{1,5} { color: red; }`)
          );

          await styleSheet.deleteRule(0);

          expect(shadowRoot.adoptedStyleSheets[0].cssRules[0].cssText).to.equal(
            'p { color: red; }'
          );
        });

        it('should cache the styleSheets by shadowRoot to improve performance', async () => {
          const registry = new CustomElementRegistry();
          const shadowRoot1 = getScopedShadowRoot(registry);
          const shadowRoot2 = getScopedShadowRoot(registry);
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync('my-tag { color: red; }');

          shadowRoot1.adoptedStyleSheets = [styleSheet];
          shadowRoot2.adoptedStyleSheets = [styleSheet];

          const [styleSheet1] = shadowRoot1.adoptedStyleSheets;
          const [styleSheet2] = shadowRoot2.adoptedStyleSheets;

          expect(styleSheet1).to.be.equal(styleSheet2);
          expect(registry.styleSheets.get(styleSheet)).to.be.equal(styleSheet1);
        });
      });
    }
  });
});
