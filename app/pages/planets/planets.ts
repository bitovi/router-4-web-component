import { Params } from "https://cdn.skypack.dev/@bitovi/router-4-web-component";

class Planets extends Params {
  private _connected = false;
  private _shadowRoot: ShadowRoot;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  protected override onParamsChange(params: Record<string, string>): void {
    console.log("Planets.onParamsChange: params=", params);
  }

  static get webComponentName(): string {
    return "app-planets";
  }

  connectedCallback() {
    if (this._connected) {
      return;
    }

    this._connected = true;

    const section = document.createElement("p");
    section.textContent = "planet content TODO";

    this._shadowRoot.append(section);
  }
}

if (!customElements.get(Planets.webComponentName)) {
  customElements.define(Planets.webComponentName, Planets);
}
