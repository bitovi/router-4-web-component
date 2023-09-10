import { BasecompParams } from "../../components/basecomp/basecomp.ts";

export class RestaurantOrder extends BasecompParams {
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
    const html = `<link href="/app/assets/place-my-order-assets.css" rel="stylesheet"></link>
<div class="order-history"><h1>place order for '${this.#slug}'</h1></div>`;

    this.#shadowRoot.innerHTML = html;
  }

  override update(changedProperties: string[]): void {
    if (changedProperties.includes("#slug")) {
      this.#updateContent();
    }
  }

  protected override _onParamsChange(params: Record<string, string>): void {
    this.setState(
      "#slug",
      this.#slug,
      params["slug"],
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
