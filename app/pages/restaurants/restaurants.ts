export class Restaurants extends HTMLElement {
  private _connected = false;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "closed" });
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
        <select>
          <option value="">Choose a state</option>
        </select>
      </div>
      <div class="form-group">
        <label>City</label>
        <select>
          <option value="">Choose a city</option>
        </select>
      </div>
    </form>
  </div>`;

    this._shadowRoot.append(link, div);
  }
}

if (!customElements.get(Restaurants.webComponentName)) {
  customElements.define(Restaurants.webComponentName, Restaurants);
}
