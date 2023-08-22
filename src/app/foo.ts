class Foo extends HTMLElement {
  _foo: HTMLElement;
  _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._foo = document.createElement("div");

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(this._foo);
  }

  static get webComponentName() {
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

if (!customElements.get(Foo.webComponentName)) {
  customElements.define(Foo.webComponentName, Foo);
}
