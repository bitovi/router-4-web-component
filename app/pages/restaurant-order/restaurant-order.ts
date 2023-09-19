// import {
//   ComponentLifecycleMixin,
//   ParamsListenerMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import {
  ComponentLifecycleMixin,
  ParamsListenerMixin
} from "../../../dist/src/index.js";

export class RestaurantOrder extends ParamsListenerMixin(
  ComponentLifecycleMixin(HTMLElement)
) {
  #shadowRoot: ShadowRoot;
  #slug: string | undefined;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "app-restaurant-order";
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();

    const html = `<link href="/app/assets/place-my-order-assets.css" rel="stylesheet"></link>
<div class="order-history"><h1>place order for '${this.#slug}'</h1></div>`;

    this.#shadowRoot.innerHTML = html;
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    if (changedProperties.includes("#slug")) {
      this.#updateContent();
    }
  }

  override onParamsChange(params: Record<string, string> | undefined): void {
    this.setState(
      "#slug",
      this.#slug,
      params ? params["slug"] : undefined,
      next => (this.#slug = next)
    );
  }

  #updateContent() {
    const h1 = this.#shadowRoot.querySelector("h1");
    if (h1) {
      h1.textContent = `place order for '${this.#slug}'`;
    }
  }
}

if (!customElements.get(RestaurantOrder.webComponentName)) {
  customElements.define(RestaurantOrder.webComponentName, RestaurantOrder);
}
