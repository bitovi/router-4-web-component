class Planets extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  constructor() {
    super();

    const section = document.createElement("p");
    section.textContent = "planet content TODO";

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(section);
  }

  static get webComponentName(): string {
    return "app-planets";
  }

  // connectedCallback() {
  //   const section = document.createElement("p");
  //   section.textContent = "planet content TODO";

  //   this._shadowRoot.append(section);
  // }
}

if (!customElements.get(Planets.webComponentName)) {
  customElements.define(Planets.webComponentName, Planets);
}
