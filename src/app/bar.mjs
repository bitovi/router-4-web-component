class Bar extends HTMLElement {
  constructor() {
    super();

    const h2 = document.createElement("h2");
    h2.textContent = "bar title";

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(h2);
  }

  static get name() {
    return "app-bar";
  }
}

if (!customElements.get(Bar.name)) {
  customElements.define(Bar.name, Bar);
}

/**
 * @type {RouteChildModule["init"]}
 */
function init() {
  return document.createElement(Bar.name);
}

/** @type {RouteChildModule} */
export { init };
