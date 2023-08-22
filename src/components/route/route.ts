import type { RouteActivationProps, RouteMatchProps } from "../../types.ts";
import { builder } from "../../libs/elementBuilder/elementBuilder.ts";
import { splitPath } from "../../libs/path/path.ts";
import { AttributesBase } from "../attributes-base/attributes-base.ts";

class Route
  extends AttributesBase
  implements RouteActivationProps, RouteMatchProps
{
  private _active: boolean;
  private _module: boolean;
  /** `path` attribute */
  private _path: string;
  private _shadowRoot: ShadowRoot;
  private _slot: HTMLSlotElement;
  /** `src` attribute */
  private _src: string | undefined;

  constructor() {
    super();

    this._active = false;
    this._module = false;
    this._slot = builder.create("slot");
    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  protected static _observedPatterns: string[] = ["path", "src"];

  static get webComponentName() {
    return "r4w-route";
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  activate() {
    if (this._active) {
      return;
    }

    this._active = true;

    // If the Route has a `src` attribute then the script file will be fetched
    // then the slot attached. If there is no source then the slot is attached
    // synchronously.
    if (this._src) {
      Promise.resolve(
        this._module
          ? undefined
          : import(this._src).then(() => {
              this._module = true;
            })
      ).then(() => {
        this._active && this._shadowRoot.append(this._slot);
      });
    } else {
      this._shadowRoot.append(this._slot);
    }
  }

  deactivate() {
    if (!this._active) {
      return;
    }

    this._active = false;

    this._slot &&
      this._shadowRoot.hasChildNodes() &&
      this._shadowRoot.removeChild(this._slot);
  }

  /******************************************************************
   * RouteMatch
   *****************************************************************/
  matchPath(path: string): boolean {
    if (0 <= this._path.indexOf(":")) {
      // The `path` contains a pattern.
      const input = splitPath(path);
      const pattern = splitPath(this._path);

      if (input.parts.length !== pattern.parts.length) {
        return false;
      }

      const params: Record<string, string> = {};
      for (let i = 0; i < input.parts.length; i++) {
        let matched = false;

        const patternDecoded = decodeURIComponent(pattern.parts[i]);
        const inputDecoded = decodeURIComponent(input.parts[i]);

        if (patternDecoded.startsWith(":")) {
          params[patternDecoded.slice(1)] = inputDecoded;
          matched = true;
        } else {
          matched = inputDecoded === patternDecoded;
        }

        if (!matched) {
          return false;
        }
      }

      console.log("Route.matchPath: params=", params);

      return true;
    }

    // No pattern, just compare the strings.
    return path === this._path;
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}

export { Route };
