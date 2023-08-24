import type { RouteActivationProps, RouteMatchProps } from "../../types";
import { builder } from "../../libs/elementBuilder/elementBuilder";
import { AttributesBase } from "../attributes-base/attributes-base";
import { Pathname } from "../pathname/pathname";

class Route
  extends AttributesBase
  implements RouteActivationProps, RouteMatchProps
{
  private _active: boolean;
  private _module: boolean;
  /** `path` attribute */
  private _path: string | undefined;
  private _shadowRoot: ShadowRoot;
  private _slot: HTMLSlotElement;
  /** `src` attribute */
  private _src: string | undefined;

  constructor() {
    super();

    this._active = false;
    this._module = false;
    this._slot = builder.create("slot");

    // This is the pattern for setting data on an element in the constructor,
    // read from attributes because they are available and set on attributes
    // because they will update the properties
    const r4wPathname: Pathname = builder.create(Pathname.webComponentName);
    r4wPathname.setAttribute("pattern", this.getAttribute("path") ?? "");

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.appendChild(r4wPathname);
  }

  protected static override _observedPatterns: string[] = ["path", "src"];

  static get webComponentName() {
    return "r4w-route";
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "path") {
      const r4wPathname = getR4wPathnameElement(this._shadowRoot);
      r4wPathname.setAttribute("pattern", newValue);
    }
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
        this._active && appendToShadow(this._shadowRoot, this._slot);
      });
    } else {
      appendToShadow(this._shadowRoot, this._slot);
    }
  }

  deactivate() {
    if (!this._active) {
      return;
    }

    this._active = false;

    this._slot && removeFromShadow(this._shadowRoot, this._slot);
  }

  /******************************************************************
   * RouteMatch
   *****************************************************************/
  setPathname(pathname: string): Promise<void> {
    return getR4wPathnameElement(this._shadowRoot).setPathname(pathname);
  }

  addMatchListener(
    onMatch: Parameters<RouteMatchProps["addMatchListener"]>[0]
  ) {
    getR4wPathnameElement(this._shadowRoot).addMatchChangeListener(data => {
      onMatch(data.match);
    });
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}

export { Route };

function appendToShadow(shadowRoot: ShadowRoot, elem: HTMLElement) {
  const r4wPathname = getR4wPathnameElement(shadowRoot);
  r4wPathname.appendChild(elem);
}

function getR4wPathnameElement(shadowRoot: ShadowRoot): Pathname {
  const r4wPathname = shadowRoot.querySelector(Pathname.webComponentName);

  if (!r4wPathname) {
    throw Error(
      `Failed to find the '${Pathname.webComponentName}' in the shadow root.`
    );
  }

  return r4wPathname as Pathname;
}

function removeFromShadow(shadowRoot: ShadowRoot, elem: HTMLElement) {
  const r4wPathname = getR4wPathnameElement(shadowRoot);
  r4wPathname.hasChildNodes() && r4wPathname.removeChild(elem);
}
