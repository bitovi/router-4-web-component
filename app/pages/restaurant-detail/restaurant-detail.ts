// import {
//   BasecompMixin,
//   ParamsMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import { BasecompMixin, ParamsListenerMixin } from "../../../dist/src/index.js";
import type { RestaurantData, RestaurantItem } from "../../types/types.ts";

export class RestaurantDetail extends ParamsListenerMixin(
  BasecompMixin(HTMLElement)
) {
  #shadowRoot: ShadowRoot;
  #slug: string | undefined;
  #restaurants: RestaurantData | undefined;
  #restaurantsLock: Promise<void> | undefined;

  constructor() {
    super();

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
      changedProperties.includes("#slug")
    ) {
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
    if (!this.#restaurants || !this.#slug) {
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

    const style =
      "<link href='/app/assets/place-my-order-assets.css' rel='stylesheet'></link>";

    const address = `<div className="address">${restaurant.address.street}<br />${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}</div>`;
    const hoursPrice =
      '<div class="hours-price">$$$<br />Hours: M-F 10am-11pm<span class="open-now">Open Now</span></div>';
    const background = `<div class="background"><h2>${restaurant.name}</h2>${address}${hoursPrice}<br /></div>`;
    const restaurantHeader = `<div class="restaurant-header" style="background-image: url('${restaurant.resources.banner}')">${background}</div>`;

    const image = `<img alt="The owner of ${restaurant.name}." src="${restaurant.resources.owner}" />`;
    const description = `<p class="description">${image}Description for ${restaurant.name}</p>`;
    const link = `<p class="order-link"><r4w-link class="btn" to="/restaurants/${restaurant.slug}/order">Order from ${restaurant.name}</r4w-link></p>`;
    const content = `<div class="restaurant-content"><h3>The best food this side of the Mississippi</h3>${description}${link}</div>`;

    this.#shadowRoot.innerHTML = style + restaurantHeader + content;
  }
}

if (!customElements.get(RestaurantDetail.webComponentName)) {
  customElements.define(RestaurantDetail.webComponentName, RestaurantDetail);
}
