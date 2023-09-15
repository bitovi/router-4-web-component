// import {
//   Basecomp
// } from "https://esm.sh/@bitovi/router-4-web-component";
import { Basecomp } from "../../../dist/src/index.js";

export class OrderHistory extends Basecomp(HTMLElement) {
  #shadowRoot: ShadowRoot;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "app-order-history";
  }

  override componentInitialConnect(): void {
    const html = `<link href="/app/assets/place-my-order-assets.css" rel="stylesheet"></link>
<div class="order-history"><h1>order history</h1></div>`;

    this.#shadowRoot.innerHTML = html;
  }
}

if (!customElements.get(OrderHistory.webComponentName)) {
  customElements.define(OrderHistory.webComponentName, OrderHistory);
}
