class Bar extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  constructor() {
    super();

    const h2 = document.createElement("h2");
    h2.textContent = "bar title";

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(h2);
  }

  static get webComponentName(): string {
    return "app-bar";
  }
}

if (!customElements.get(Bar.webComponentName)) {
  customElements.define(Bar.webComponentName, Bar);
}
