class Foo extends HTMLElement {
  constructor() {
    super();

    this._foo = document.createElement("div");

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(this._foo);
  }

  static get name() {
    return "app-foo";
  }

  connectedCallback() {
    const p = document.createElement("p");
    p.id = "time";
    p.textContent = new Date().toTimeString();

    this._foo.append(p);
  }

  disconnectedCallback() {
    this._foo.removeChild(this._shadowRoot.querySelector("#time"));
  }
}

if (!customElements.get(Foo.name)) {
  customElements.define(Foo.name, Foo);
}
