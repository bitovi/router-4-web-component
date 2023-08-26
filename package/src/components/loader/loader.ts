import type { RouteActivationProps, WebComponent } from "../../types.js";

export class Loader
  extends HTMLElement
  implements RouteActivationProps, WebComponent
{
  private _module = false;
  private _src: string | undefined;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ["src"];
  }

  static get webComponentName() {
    return "r4w-loader";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "src") {
      this._src = newValue;
    }
  }

  activate() {
    if (this._module || !this._src) {
      return;
    }

    const src = this._src;

    this._module = true;
    import(src);
  }

  deactivate() {
    // no-op
  }
}

if (!customElements.get(Loader.webComponentName)) {
  customElements.define(Loader.webComponentName, Loader);
}
