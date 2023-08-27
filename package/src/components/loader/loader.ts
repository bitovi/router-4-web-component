import type { RouteActivationProps, WebComponent } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

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

  async activate() {
    if (this._module || !this._src) {
      return;
    }

    const src = documentUrl(this._src);

    this._module = true;
    return import(src);
  }

  deactivate() {
    // no-op
  }
}

if (!customElements.get(Loader.webComponentName)) {
  customElements.define(Loader.webComponentName, Loader);
}
