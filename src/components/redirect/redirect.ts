class Redirect extends HTMLElement implements Redirector {
  constructor() {
    super();
  }

  static get webComponentName() {
    return "r4w-redirect";
  }

  static get observedAttributes() {
    return ["to"];
  }

  get to(): string | null {
    return this.getAttribute("to");
  }
}

if (!customElements.get(Redirect.webComponentName)) {
  customElements.define(Redirect.webComponentName, Redirect);
}

export { Redirect };

export interface Redirector {
  to: Readonly<string | null>;
}
