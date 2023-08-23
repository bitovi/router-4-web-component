import { builder } from "../../libs/elementBuilder/elementBuilder.ts";
import type { RouteActivationProps, RouteMatchProps } from "../../types.ts";

class Route
  extends HTMLElement
  implements RouteActivationProps, RouteMatchProps
{
  _active: boolean;
  _module: boolean;
  _shadowRoot: ShadowRoot;
  _slot: HTMLSlotElement;

  constructor() {
    super();

    this._active = false;
    this._module = false;
    this._slot = builder.create("slot");
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(this._slot);
  }

  static get webComponentName() {
    return "r4w-route";
  }

  /******************************************************************
   * RouteMatch
   *****************************************************************/
  matchPath(path: string): boolean {
    return path === this.getAttribute("path");
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  activate() {
    if (this._active) {
      return;
    }

    this._active = true;

    Promise.resolve(
      this._module
        ? undefined
        : import(createImportPath(this.getAttribute("path"))).then(() => {
            this._module = true;
          })
    ).then(() => {
      this._active && this._shadowRoot.append(this._slot);
    });
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
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}

export { Route };

/**
 * @param {string} path
 * @returns {string}
 */
function createImportPath(path: string): string {
  return `${path}.mjs`;
}
