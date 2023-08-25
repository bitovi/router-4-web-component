import { builder } from "../../libs/elementBuilder/elementBuilder.js";
import { AttributesBase } from "../attributes-base/attributes-base.js";

export class Loader extends AttributesBase {
  private _shadowRoot: ShadowRoot;
  private _src: string | undefined;

  constructor() {
    super();

    const fallback = builder.create("slot", {
      properties: { name: "fallback" }
    });
    const child = builder.create("slot", { properties: { name: "child" } });

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(fallback, child);
  }

  protected static override _observedPatterns: string[] = ["to"];

  static get webComponentName() {
    return "r4w-fallback";
  }

  connectedCallback() {
    if (!this._src) {
      return;
    }

    const src = this._src;

    setTimeout(() => {
      import(src);
    }, 3000);
  }
}

if (!customElements.get(Loader.webComponentName)) {
  customElements.define(Loader.webComponentName, Loader);
}
