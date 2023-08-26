import type {
  ElementUidProps,
  ParamsChangeEventDetails,
  RouteActivationProps,
  RouteMatchProps,
  WebComponent
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { findParentRouter } from "../../libs/r4w/r4w.ts";
import { Pathname } from "../pathname/pathname.ts";
import { Loader } from "../loader/loader.ts";

/**
 * Incremented for each Route instance that's created.
 */
let uidCount = 0;

/**
 * Attributes:
 *   - path {string} The path that is cognate with the `to` attribute of a link.
 *   - src {string} The URL of the module associated with this route.
 */
export class Route
  extends HTMLElement
  implements
    ElementUidProps,
    RouteActivationProps,
    RouteMatchProps,
    WebComponent
{
  private _active: boolean;
  private _connected = false;
  private _lastParams: Record<string, string> | undefined;
  private _loader: Loader | undefined;
  /** `path` attribute */
  private _path: string | undefined;
  private _pathname: Pathname | undefined;
  private _shadowRoot: ShadowRoot;
  private _slot: HTMLSlotElement | undefined;
  /** `src` attribute */
  private _src: string | undefined;
  private _uid: string;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this._uid = `r4w-route-${uidCount}`;

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

    const router = findParentRouter(this.parentElement);

    if (!router) {
      throw Error(
        "Could not found a Router ancestor. <r4w-route> must be a child of an <r4w-router> element."
      );
    }

    this._slot = create("slot", {
      attributes: { style: "display:none;" },
      listeners: {
        slotchange: () => {
          this._slot?.assignedElements().forEach(e => {
            // These are used by the `Params` class to determine if an event is
            // from its own route.
            e.setAttribute(this.uid, "");
            e.setAttribute(router.uid, "");
          });
        }
      }
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
   * ElementUidProps
   *****************************************************************/
  get uid(): string {
    return this._uid;
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  async activate() {
    if (this._active) {
      return;
    }

    this._active = true;

    // Our slot contains the element to be presented when the route is active.
    this._slot?.setAttribute("style", "");

    // When the loader is activated, and it hasn't already downloaded the
    // module, it downloads the module.
    await this._loader?.activate();

    // Have the params changed? If so fire off an event.
    const router = findParentRouter(this.parentElement);

    if (!router) {
      throw Error(
        "Could not found a Router ancestor. <r4w-route> must be a child of an <r4w-router> element."
      );
    }

    const evt = new CustomEvent<ParamsChangeEventDetails>("r4w-params-change", {
      bubbles: true,
      composed: true,
      detail: {
        params: this._lastParams ?? {},
        routerUid: router.uid,
        routeUid: this.uid
      }
    });

    window.dispatchEvent(evt);
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
    this._pathname?.addMatchChangeListener(data => {
      // TODO: don't save these, change the Pathname interface so that we can
      // invoke a method at any time to get the params.
      this._lastParams = data.params;

      onMatch(data.match);
    });
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}
