import type {
  PathnameProps,
  RouteActivationProps,
  RouteMatchProps,
  WebComponent
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { Pathname } from "../pathname/pathname.ts";
import { Loader } from "../loader/loader.ts";

/**
 * Attributes:
 *   - path {string} The path that is cognate with the `to` attribute of a link.
 *   - src {string} The URL of the module associated with this route.
 */
export class Route
  extends HTMLElement
  implements RouteActivationProps, RouteMatchProps, WebComponent
{
  private _active: boolean;
  private _connected = false;
  private _loader: Loader | undefined;
  /** `path` attribute */
  private _path: string | undefined;
  private _pathname: Pathname | undefined;
  private _shadowRoot: ShadowRoot;
  private _slot: HTMLSlotElement | undefined;
  /** `src` attribute */
  private _src: string | undefined;

  constructor() {
    super();

    this._active = false;
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
    switch (name) {
      case "path": {
        this._path = newValue;
      }
      case "src": {
        this._src = newValue;
        break;
      }
    }
  }

  connectedCallback() {
    if (this._connected) {
      return;
    }

    this._connected;

    this._slot = create("slot", {
      attributes: { style: "display:none;" }
    });

    this._loader = create(
      Loader.webComponentName,
      {
        attributes: { src: this._src }
      },
      this._slot
    ) as Loader;

    this._pathname = create(
      Pathname.webComponentName,
      {
        attributes: { pattern: this._path }
      },
      this._loader
    ) as Pathname;

    this._shadowRoot.appendChild(this._pathname);
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  activate() {
    if (this._active) {
      return;
    }

    this._active = true;

    // Our slot contains the element to be presented when the route is active.
    this._slot?.setAttribute("style", "");

    // When the loader is activated, and it hasn't already downloaded the
    // module, it downloads the module.
    this._loader?.activate();
  }

  deactivate() {
    if (!this._active) {
      return;
    }

    this._active = false;

    // Remove the slot content from the display. We could in the future allow
    // client to "release" the slot and module to free up memory then fetch and
    // attach them again when needed.
    this._slot?.setAttribute("style", "display:none;");
  }

  /******************************************************************
   * RouteMatch
   *****************************************************************/
  setPathname(pathname: string): Promise<void> {
    return Promise.resolve(this._pathname?.setPathname(pathname));
  }

  addMatchListener(
    onMatch: Parameters<RouteMatchProps["addMatchListener"]>[0]
  ) {
    this._pathname?.addMatchChangeListener(data => onMatch(data.match));
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}
