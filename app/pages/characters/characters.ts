class Characters extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  constructor() {
    super();

    const section = document.createElement("section");
    section.textContent = "character content TODO";

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(section);
  }

  static get webComponentName(): string {
    return "app-characters";
  }
}

if (!customElements.get(Characters.webComponentName)) {
  customElements.define(Characters.webComponentName, Characters);
}
