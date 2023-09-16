// import {
//   BasecompMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import { BasecompMixin } from "../../../dist/src/index.js";

export class Debug extends BasecompMixin(HTMLElement) {
  #shadowRoot: ShadowRoot;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "app-debug";
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();

    const html = `<div style="background-color: lightgray;height: 100px;position: fixed;width: 100px"><p>This is a test element.</p></div>`;

    this.#shadowRoot.innerHTML = html;
  }
}

if (!customElements.get(Debug.webComponentName)) {
  customElements.define(Debug.webComponentName, Debug);
}
