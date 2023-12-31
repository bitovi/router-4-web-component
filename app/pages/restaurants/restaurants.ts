// import {
//   ComponentLifecycleMixin,
//   TemplateMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import {
  ComponentLifecycleMixin,
  TemplateMixin
} from "../../../dist/src/index.js";
import type { RestaurantData } from "../../types/types.ts";
import type { Dropdown } from "../../components/dropdown/dropdown.ts";
import "../../components/dropdown/dropdown.ts";

export class Restaurants extends TemplateMixin(
  ComponentLifecycleMixin(HTMLElement)
) {
  #regionsLock: Promise<void> | undefined;
  #restaurantsLock: Promise<void> | undefined;
  protected _cities: { [region: string]: [{ name: string }] } | undefined;
  protected _regions: Array<{ name: string; short: string }> | undefined;
  protected _restaurants: RestaurantData | undefined;
  protected _selectedCity: string | undefined;
  protected _selectedRegion: string | undefined;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this.template_src = "app/pages/restaurants/restaurants.html";
    this._shadowRoot = this.attachShadow({ mode: "closed" });

    this.#getRegions();
  }

  static get webComponentName(): string {
    return "app-restaurants";
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    // console.log(
    //   `Restaurants.update: changedProperties='${changedProperties.join(", ")}'`
    // );

    if (changedProperties.includes("_regions")) {
      const div = this.#restaurantsElement;
      this.populateRegionsList(div);
    }

    if (changedProperties.includes("_cities")) {
      const div = this.#restaurantsElement;
      if (div) {
        this._selectedRegion &&
          this.populateCitiesList(this._selectedRegion, div);

        const city = div.querySelector("#city") as HTMLSelectElement;
        city.disabled = false;
      }
    }

    if (changedProperties.includes("_selectedRegion")) {
      this.#selectedRegionChanged();
    }

    if (changedProperties.includes("_selectedCity")) {
      this.#selectedCityChanged();
    }

    if (changedProperties.includes("_restaurants")) {
      this.#updateRestaurants(this._selectedRegion, this._selectedCity);
    }
  }

  override _onTemplateReady(): void {
    this.#updateDOM();
    this.populateRegionsList(this.#restaurantsElement);
  }

  protected async populateCitiesList(
    region: string,
    content: Element | null
  ): Promise<void> {
    if (!content) {
      return;
    }

    if (!this._cities) {
      return;
    }

    const select = content.querySelector("#city");
    if (!isDropdown(select)) {
      return;
    }

    select.items = this._cities[region].map(({ name }) => ({
      key: name,
      text: name,
      value: name
    }));
  }

  protected async populateRegionsList(content: Element | null): Promise<void> {
    if (!content) {
      return;
    }

    if (!this._regions) {
      return;
    }

    if (!this.template_html) {
      return;
    }

    const region = content.querySelector("#region");
    if (!isDropdown(region)) {
      return;
    }

    if (region.items) {
      return;
    }

    region.items = this._regions.map(({ name, short }) => ({
      key: short,
      text: name,
      value: short
    }));
  }

  protected async populateRestaurantsTable(
    region: string,
    city: string
  ): Promise<void> {
    if (!this._restaurants) {
      return;
    }

    const items = this._restaurants[region][city].map(
      ({ address, name, resources, slug }) => {
        const restaurant = document.createElement("div");
        restaurant.className = "restaurant";

        restaurant.innerHTML = `<img src="${resources.thumbnail}" alt="${name}" height="100" width="100" />
  <h3>${name}</h3>
  <div class="address">
    ${address.street}<br />${address.city}, ${address.state} ${address.zip}
  </div>
  <div class="hours-price">
    $$$<br />Hours: M-F 10am-11pm<span class="open-now">Open Now</span>
  </div>
  <r4w-link class="btn" to="/restaurants/${slug}">Details</r4w-link>`;
        return restaurant;
      }
    );

    const div = this.#restaurantsElement;
    div && div.append(...items);
  }

  get #cityElement() {
    const city = this._shadowRoot.querySelector("#city");
    return isDropdown(city) ? (city as Dropdown) : undefined;
  }

  get #restaurantElements() {
    return this._shadowRoot.querySelectorAll(".restaurant");
  }

  get #restaurantsElement() {
    return this._shadowRoot.querySelector(".restaurants");
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

  #selectedCityChanged() {
    if (!isValidCity(this._selectedCity)) {
      this._selectedRegion &&
        this.populateCitiesList(this._selectedRegion, this.#restaurantsElement);
    } else {
      this._selectedRegion && this.#getRestaurants();
    }

    this.#updateRestaurants(this._selectedRegion, this._selectedCity);
  }

  #selectedRegionChanged() {
    this._selectedRegion && this.#getCities(this._selectedRegion);

    const city = this.#cityElement;
    city && (city.disabled = false);

    this.setState(
      "_selectedCity",
      this._selectedCity,
      "default",
      next => (this._selectedCity = next)
    );
  }

  #getCities(region: string): Promise<Array<{ name: string }> | undefined> {
    if (this._cities) {
      return Promise.resolve(this._cities[region]);
    }

    return new Promise<Array<{ name: string }> | undefined>(resolve => {
      this.#apiFetch("app/api/cities.json", response =>
        response.json().then(body => {
          this.setState(
            "_cities",
            this._cities,
            body.data,
            next => (this._cities = next)
          );
          resolve(this._cities ? this._cities[region] : undefined);
        })
      );
    });
  }

  #getRegions(): Promise<void> {
    if (!this.#regionsLock) {
      this.#regionsLock = this.#apiFetch("app/api/regions.json", response =>
        response.json().then(body => {
          this.setState(
            "_regions",
            this._regions,
            body.data,
            next => (this._regions = next)
          );
        })
      );
    }

    return this.#regionsLock;
  }

  #getRestaurants(): Promise<void> {
    if (this._restaurants) {
      return Promise.resolve();
    }

    if (!this.#restaurantsLock) {
      this.#restaurantsLock = this.#apiFetch(
        `app/api/restaurants.json`,
        response =>
          response.json().then(body => {
            this.setState(
              "_restaurants",
              this._restaurants,
              body.data,
              next => (this._restaurants = next)
            );
          })
      );
    }

    return this.#restaurantsLock;
  }

  #updateDOM(): void {
    if (!this.template_html) {
      return;
    }

    const div = document.createElement("div");
    div.innerHTML = this.template_html;

    const region = div.querySelector("#region") as HTMLSelectElement;
    const city = div.querySelector("#city") as HTMLSelectElement;

    if (isDropdown(region)) {
      region.defaultItem = {
        key: "default",
        text: "Choose a state",
        value: "",
        selected: true
      };
    }

    region.addEventListener("change", evt => {
      this.setState(
        "_selectedRegion",
        this._selectedRegion,
        (evt.target as HTMLSelectElement).value,
        next => (this._selectedRegion = next)
      );
    });

    if (isDropdown(city)) {
      city.defaultItem = {
        key: "default",
        text: "Choose a city",
        value: "",
        selected: true
      };
      city.disabled = true;
    }

    city.addEventListener("change", evt => {
      this.setState(
        "_selectedCity",
        this._selectedCity,
        (evt.target as HTMLSelectElement).value,
        next => (this._selectedCity = next)
      );
    });

    const link = document.createElement("link");
    link.href = "/app/assets/place-my-order-assets.css";
    link.rel = "stylesheet";

    this._shadowRoot.append(link, div);
  }

  #updateRestaurants(region: string | undefined, city: string | undefined) {
    const children = this.#restaurantElements;
    children.forEach(r => r.remove());

    if (region && isValidCity(city)) {
      this.populateRestaurantsTable(region, city);
    }
  }
}

if (!customElements.get(Restaurants.webComponentName)) {
  customElements.define(Restaurants.webComponentName, Restaurants);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDropdown(obj: any): obj is Dropdown {
  return obj && "items" in obj && "defaultItem" in obj;
}

function isValidCity(city: string | undefined): city is string {
  return !!city && city !== "default";
}
