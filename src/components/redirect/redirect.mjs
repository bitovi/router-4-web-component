class Redirect extends HTMLElement {
  constructor() {
    super();
  }

  static get name() {
    return "r4w-redirect";
  }

  static get observedAttributes() {
    return ["to"];
  }

  /**
   * @returns {string | null}
   */
  get to() {
    return this.getAttribute("to");
  }
}

if (!customElements.get(Redirect.name)) {
  customElements.define(Redirect.name, Redirect);
}

export { Redirect };
