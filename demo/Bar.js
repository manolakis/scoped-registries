export class Bar extends HTMLElement {
  constructor() {
    super();
    // Use the local registry when creating the ShadowRoot
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }

    this.shadowRoot.innerHTML = '<span>Bar</span>';
  }
}
