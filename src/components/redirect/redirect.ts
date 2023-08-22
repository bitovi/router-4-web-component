import { RouteSelector } from "../../types";

class Redirect extends HTMLElement implements RouteSelector {
  private _to: string;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ["to"];
  }

  static get webComponentName() {
    return "r4w-redirect";
  }

  get to(): string {
    return this._to;
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    this[`_${name}`] = newValue;
  }
}

if (!customElements.get(Redirect.webComponentName)) {
  customElements.define(Redirect.webComponentName, Redirect);
}

export { Redirect };
