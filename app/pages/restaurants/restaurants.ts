import { Dropdown } from "../../components/dropdown/dropdown.ts";

export class Restaurants extends HTMLElement {
  private _connected = false;
  private _regionsLock: Promise<void> | undefined;
  protected _cities: { [region: string]: [{ name: string }] } | undefined;
  protected _regions: { name: string; short: string }[] | undefined;
  protected _selectedRegion: string | undefined;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "closed" });

    this.getRegions();
  }

  static get webComponentName() {
    return "app-restaurants";
  }

  connectedCallback() {
    if (this._connected) {
      return;
    }

    this._connected = true;

    const link = document.createElement("link");
    link.href = "/app/place-my-order-assets.css";
    link.rel = "stylesheet";

    const content = this.getContent();

    this.populateRegionsList(content);

    this._shadowRoot.append(link, content);
  }

  protected getContent() {
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
    // </div>

    const div = document.createElement("div");
    div.innerHTML = `  <div class="restaurants">
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
      this._selectedRegion = (evt.target as HTMLSelectElement).value;
      city.disabled = false;
      this.populateCitiesList((evt.target as HTMLSelectElement).value, div);
    });

    city.addEventListener("change", () =>
      console.log("Restaurants.connectedCallback: city change.")
    );

    return div;
  }

  protected async populateCitiesList(region: string, content: HTMLElement) {
    const cities = await this.getCities(region);

    if (!cities) {
      return;
    }

    const select = content.querySelector("#city") as Dropdown;
    if (!select) {
      return;
    }

    select.items = [
      { key: "default", text: "Choose a city", value: "", selected: true },
      ...cities.map(({ name }) => ({
        key: name,
        text: name,
        value: name
      }))
    ];
  }

  protected async populateRegionsList(content: HTMLElement) {
    await this.getRegions();

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

  private getCities(region: string): Promise<{ name: string }[] | undefined> {
    if (this._cities) {
      return Promise.resolve(this._cities[region]);
    }

    return new Promise<{ name: string }[] | undefined>(resolve => {
      this.apiFetch("app/api/cities.json", response =>
        response.json().then(body => {
          this._cities = body.data;
          resolve(this._cities ? this._cities[region] : undefined);
        })
      );
    });
  }

  private getRegions(): Promise<void> {
    if (!this._regionsLock) {
      this._regionsLock = this.apiFetch("app/api/regions.json", response =>
        response.json().then(body => {
          this._regions = body.data;
        })
      );
    }

    return this._regionsLock;
  }

  private apiFetch(
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
