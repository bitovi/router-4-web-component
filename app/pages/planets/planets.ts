import { Params } from "../../../dist/src/index.js";

class Planets extends Params {
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
    const section = document.createElement("p");
    section.textContent = "planet content TODO";

    this._shadowRoot.append(section);
  }
}

if (!customElements.get(Planets.webComponentName)) {
  customElements.define(Planets.webComponentName, Planets);
}
