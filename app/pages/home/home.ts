import { Basecomp } from "../../components/basecomp/basecomp.ts";

export class Home extends Basecomp(HTMLElement) {
  #shadowRoot: ShadowRoot;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName() {
    return "app-home";
  }

  override componentInitialConnect(): void {
    const link = document.createElement("link");
    link.href = "/app/assets/place-my-order-assets.css";
    link.rel = "stylesheet";

    const div = document.createElement("div");
    div.innerHTML = `  <div class="homepage">
    <img alt="Restaurant table with glasses." src="app/assets/homepage-hero.jpg" width="250" height="380" />
    <h1>Ordering food has never been easier</h1>
    <p>We make it easier than ever to order gourmet food from your favorite local restaurants.</p>
    <p><r4w-link class="btn" role="button" to="/restaurants">Choose a Restaurant</r4w-link></p>
  </div>`;

    this.#shadowRoot.append(link, div);
  }
}

if (!customElements.get(Home.webComponentName)) {
  customElements.define(Home.webComponentName, Home);
}
