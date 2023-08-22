import type { RouteSelector } from "../../types";
import { AttributesBase } from "../attributes-base/attributes-base.ts";

class Redirect extends AttributesBase implements RouteSelector {
  private _to: string;

  constructor() {
    super();
  }

  protected static _observedPatterns: string[] = ["to"];

  static get webComponentName() {
    return "r4w-redirect";
  }

  get to(): string {
    return this._to;
  }
}

if (!customElements.get(Redirect.webComponentName)) {
  customElements.define(Redirect.webComponentName, Redirect);
}

export { Redirect };
