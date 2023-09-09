import { Basecomp } from "../../components/basecomp/basecomp.ts";
import { Dropdown } from "../../components/dropdown/dropdown.ts";

export class Restaurants extends Basecomp(HTMLElement) {
  #regionsLock: Promise<void> | undefined;
  protected _cities: { [region: string]: [{ name: string }] } | undefined;
  protected _regions: { name: string; short: string }[] | undefined;
  protected _selectedRegion: string | undefined;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "closed" });

    this.#getRegions();
  }

  static get webComponentName() {
    return "app-restaurants";
  }

  override componentConnected(): void {
    const link = document.createElement("link");
    link.href = "/app/place-my-order-assets.css";
    link.rel = "stylesheet";

    //   <div className="restaurants">
    //     <h2 className="page-header">Restaurants</h2>
    //     <form className="form">
    //         <div className="form-group">
    //             <label>State</label>
    //             <select onChange={onRegionChange} value={region}>
    //                 <option value="">{0 < regions.length ? "Choose a state" : LOADING_MESSAGE}</option>
    //                 {regions.map(({ name, short }) => (<option key={short} value={short}>{name}</option>))}
    //             </select>
    //         </div>
    //         <div className="form-group">
    //             <label>City</label>
    //             <select disabled={!region} onChange={onCityChange} value={city}>
    //                 {cityOptions}
    //             </select>
    //         </div>
    //     </form>
    //     {restaurantList}
    //   </div>

    const div = document.createElement("div");
    div.innerHTML = `<div class="restaurants">
  <h2 class="page-header">Restaurants</h2>
  <form class="form">
    <div class="form-group">
      <label>State</label>
      <${Dropdown.webComponentName} id="region" />
    </div>
    <div class="form-group">
      <label>City</label>
      <${Dropdown.webComponentName} id="city" />
    </div>
  </form>
</div>`;

    const region = div.querySelector("#region") as HTMLSelectElement;
    const city = div.querySelector("#city") as HTMLSelectElement;

    region.addEventListener("change", evt => {
      this.setState(
        "_selectedRegion",
        this._selectedRegion,
        (evt.target as HTMLSelectElement).value,
        next => (this._selectedRegion = next)
      );
    });

    city.addEventListener("change", () =>
      console.log("Restaurants.connectedCallback: city change.")
    );

    this._shadowRoot.append(link, div);
  }

  override update(changedProperties: string[]): void {
    if (changedProperties.includes("_regions")) {
      const div = this._shadowRoot.querySelector(".restaurants");
      this.populateRegionsList(div);
    }

    if (changedProperties.includes("_cities")) {
      const div = this._shadowRoot.querySelector(".restaurants");
      if (div) {
        this._selectedRegion &&
          this.populateCitiesList(this._selectedRegion, div);

        const city = div.querySelector("#city") as HTMLSelectElement;
        city.disabled = false;
      }
    }

    if (changedProperties.includes("_selectedRegion")) {
      this._selectedRegion && this.#getCities(this._selectedRegion);
    }
  }

  protected async populateCitiesList(region: string, content: Element | null) {
    if (!content) {
      return;
    }

    if (!this._cities) {
      return;
    }

    const select = content.querySelector("#city") as Dropdown;
    if (!select) {
      return;
    }

    select.items = [
      { key: "default", text: "Choose a city", value: "", selected: true },
      ...this._cities[region].map(({ name }) => ({
        key: name,
        text: name,
        value: name
      }))
    ];
  }

  protected async populateRegionsList(content: Element | null) {
    if (!content) {
      return;
    }

    if (!this._regions) {
      return;
    }

    const region = content.querySelector("#region") as Dropdown;
    if (!region) {
      return;
    }

    region.items = [
      { key: "default", text: "Choose a state", value: "", selected: true },
      ...this._regions.map(({ name, short }) => ({
        key: short,
        text: name,
        value: short
      }))
    ];
  }

  #getCities(region: string): Promise<{ name: string }[] | undefined> {
    if (this._cities) {
      return Promise.resolve(this._cities[region]);
    }

    return new Promise<{ name: string }[] | undefined>(resolve => {
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
}

if (!customElements.get(Restaurants.webComponentName)) {
  customElements.define(Restaurants.webComponentName, Restaurants);
}
