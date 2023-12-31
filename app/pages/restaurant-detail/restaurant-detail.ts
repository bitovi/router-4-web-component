// import {
//   ComponentLifecycleMixin,
//   ParamsListenerMixin,
//   TemplateMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import {
  ComponentLifecycleMixin,
  ParamsListenerMixin,
  TemplateMixin
} from "../../../dist/src/index.js";
import type { RestaurantData, RestaurantItem } from "../../types/types.ts";

export class RestaurantDetail extends ParamsListenerMixin(
  TemplateMixin(ComponentLifecycleMixin(HTMLElement))
) {
  #shadowRoot: ShadowRoot;
  #slug: string | undefined;
  #restaurants: RestaurantData | undefined;
  #restaurantsLock: Promise<void> | undefined;

  constructor() {
    super();

    this.template_src = "app/pages/restaurant-detail/restaurant-detail.html";
    this.#shadowRoot = this.attachShadow({ mode: "closed" });

    this.#getRestaurants();
  }

  static get webComponentName(): string {
    return "app-restaurant-detail";
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();

    const link = document.createElement("link");
    link.href = "/app/assets/place-my-order-assets.css";
    link.rel = "stylesheet";

    this.#shadowRoot.append(link);
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    if (
      changedProperties.includes("#restaurants") ||
      changedProperties.includes("#slug") ||
      changedProperties.includes("template_html")
    ) {
      this.#updateContent();
    }
  }

  override _onParamsChange(params: Record<string, string> | undefined): void {
    this.setState(
      "#slug",
      this.#slug,
      params ? params["slug"] : undefined,
      next => (this.#slug = next)
    );
  }

  #apiFetch(
    path: string,
    callback: (response: Response) => Promise<void>
  ): Promise<void> {
    return new Promise<void>(resolve => {
      fetch(path)
        .then(response => callback(response))
        .then(() => resolve());
    });
  }

  #getRestaurants(): Promise<void> {
    if (this.#restaurants) {
      return Promise.resolve();
    }

    if (!this.#restaurantsLock) {
      this.#restaurantsLock = this.#apiFetch(
        `app/api/restaurants.json`,
        response =>
          response.json().then(body => {
            this.setState(
              "#restaurants",
              this.#restaurants,
              body.data,
              next => (this.#restaurants = next)
            );
          })
      );
    }

    return this.#restaurantsLock;
  }

  #updateContent() {
    if (!this.#restaurants || !this.#slug || !this.template_html) {
      return;
    }

    const data = this.#restaurants;
    const slug = this.#slug;

    let restaurant: RestaurantItem | undefined;
    for (const region of Object.keys(data)) {
      for (const city of Object.keys(data[region])) {
        restaurant = data[region][city].find(r => r.slug === slug);

        if (restaurant) {
          break;
        }
      }

      if (restaurant) {
        break;
      }
    }

    if (!restaurant) {
      return;
    }

    this.#shadowRoot.innerHTML =
      this._replace({
        restaurant_resources_banner: restaurant.resources.banner,
        restaurant_name: restaurant.name,
        restaurant_address_street: restaurant.address.street,
        restaurant_address_city: restaurant.address.city,
        restaurant_address_state: restaurant.address.state,
        restaurant_address_zip: restaurant.address.zip,
        restaurant_resources_owner: restaurant.resources.owner,
        restaurant_slug: restaurant.slug
      }) ?? "";
  }
}

if (!customElements.get(RestaurantDetail.webComponentName)) {
  customElements.define(RestaurantDetail.webComponentName, RestaurantDetail);
}
