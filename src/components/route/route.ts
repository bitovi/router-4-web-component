import { builder } from "../../libs/elementBuilder/elementBuilder.ts";
import type { RouteActivationProps, RouteMatchProps } from "../../types.ts";

class Route
  extends HTMLElement
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

  static get observedAttributes(): string[] {
    return ["path", "src"];
  }

  static get webComponentName() {
    return "r4w-route";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    this[`_${name}`] = newValue;
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
    return path === this._path;
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}

export { Route };
