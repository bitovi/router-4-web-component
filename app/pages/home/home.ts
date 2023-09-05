export class Home extends HTMLElement {
  private _connected = false;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName() {
    return "app-home";
  }

  connectedCallback() {
    if (this._connected) {
      return;
    }

    this._connected = true;

    const link = document.createElement("link");
    link.href = "/app/place-my-order-assets.css";
    link.rel = "stylesheet";

    const div = document.createElement("div");
    div.innerHTML = `  <div class="homepage">
    <img alt="Restaurant table with glasses." src="app/assets/homepage-hero.jpg" width="250" height="380" />
    <h1>Ordering food has never been easier</h1>
    <p>We make it easier than ever to order gourmet food from your favorite local restaurants.</p>
    <p><r4w-link class="btn" role="button" to="/restaurants">Choose a Restaurant</r4w-link></p>
  </div>`;

    this._shadowRoot.append(link, div);
  }
}

if (!customElements.get(Home.webComponentName)) {
  customElements.define(Home.webComponentName, Home);
}
