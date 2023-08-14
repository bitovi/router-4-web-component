// import { RouterForWebComponentBase } from "../r4w-base/r4w-base.mjs";

/**
 * The base element for routing. Accepts one child element.
 */
class Router extends HTMLElement {
  constructor() {
    super();

    this._slot = document.createElement("slot");
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.append(this._slot);
  }

  static get name() {
    return "r4w-router";
  }

  connectedCallback() {
    console.log("Router.connectedCallback");
  }

  disconnectedCallback() {
    console.log("Router.disconnectedCallback");
  }
}

if (!customElements.get(Router.name)) {
  customElements.define(Router.name, Router);
}

export { Router };
