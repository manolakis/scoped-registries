let counter = 0;

export const getTestTagName = () => {
  counter += 1;

  return `test-${counter}-element`;
};

export const getScopedShadowRoot = (
  customElementRegistry = window.customElements
) => {
  const tagName = getTestTagName();
  const Element = class extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({
        mode: 'open',
        customElements: customElementRegistry,
      });
    }
  };

  window.customElements.define(tagName, Element);

  const { shadowRoot } = new Element();

  return shadowRoot;
};
