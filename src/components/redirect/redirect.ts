class Redirect extends HTMLElement implements RedirectProps {
  constructor() {
    super();
  }

  static get webComponentName() {
    return "r4w-redirect";
  }

  static get observedAttributes() {
    return ["to"];
  }

  get to(): string {
    return this.getAttribute("to");
  }
}

if (!customElements.get(Redirect.webComponentName)) {
  customElements.define(Redirect.webComponentName, Redirect);
}

export { Redirect };

export interface RedirectProps {
  readonly to: string;
}
