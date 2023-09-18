import {
  ComponentLifecycleMixin,
  TemplateMixin
} from "https://esm.sh/@bitovi/router-4-web-component";
// import {
//   ComponentLifecycleMixin,
//   TemplateMixin
// } from "../../../dist/src/index.js";

export class Home extends TemplateMixin(ComponentLifecycleMixin(HTMLElement)) {
  #shadowRoot: ShadowRoot;

  constructor() {
    super();

    this.template_src = "app/pages/home/home.html";
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "app-home";
  }

  override _onTemplateReady(): void {
    this.#updateDOM();
  }

  #updateDOM() {
    if (!this.template_html) {
      return;
    }

    const link = document.createElement("link");
    link.href = "/app/assets/place-my-order-assets.css";
    link.rel = "stylesheet";

    const div = document.createElement("div");
    div.innerHTML = this.template_html;

    this.#shadowRoot.append(link, div);
  }
}

if (!customElements.get(Home.webComponentName)) {
  customElements.define(Home.webComponentName, Home);
}
