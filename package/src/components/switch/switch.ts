import type {
  RouteMatchProps,
  ElementUidProps,
  SwitchUidRequestEventDetails,
  RouteActivateEventDetails
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";
// import { Redirect } from "../redirect/redirect.ts";

/**
 * Incremented for each Switch instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
export class Switch
  extends BasecompMixin(HTMLElement)
  implements ElementUidProps
{
  #handleRouteActivateEventBound:
    | ((evt: CustomEvent<RouteActivateEventDetails>) => void)
    | undefined;
  #handleSwitchUidRequestEventBound:
    | ((evt: CustomEvent<SwitchUidRequestEventDetails>) => void)
    | undefined;
  #uid: string;
  protected _activeRoute: RouteMatchProps | null = null;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-switch-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "r4w-switch";
  }

  get uid(): string {
    return this.#uid;
  }

  /******************************************************************
   * Basecomp
   *****************************************************************/

  override componentConnect(): void {
    super.componentConnect && super.componentConnect();

    this.#connectListeners();
  }

  override componentDisconnect(): void {
    super.componentDisconnect && super.componentDisconnect();

    this.#disconnectListeners();
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();

    this._shadowRoot.append(create("slot"));
  }

  /******************************************************************
   * private
   *****************************************************************/

  #connectListeners() {
    this.#handleSwitchUidRequestEventBound =
      this.#handleSwitchUidRequestEvent.bind(this);

    addEventListenerFactory(
      "r4w-switch-uid-request",
      this
    )(this.#handleSwitchUidRequestEventBound);

    this.#handleRouteActivateEventBound =
      this.#handleRouteActivateEvent.bind(this);

    addEventListenerFactory(
      "r4w-route-activate",
      this
    )(this.#handleRouteActivateEventBound);
  }

  #disconnectListeners() {
    this.#handleSwitchUidRequestEventBound &&
      this.removeEventListener(
        "r4w-switch-uid-request",
        this.#handleSwitchUidRequestEventBound as (evt: Event) => void
      );

    this.#handleSwitchUidRequestEventBound = undefined;

    this.#handleRouteActivateEventBound &&
      this.removeEventListener(
        "r4w-route-activate",
        this.#handleRouteActivateEventBound as (evt: Event) => void
      );

    this.#handleRouteActivateEventBound = undefined;
  }

  #handleRouteActivateEvent(evt: CustomEvent<RouteActivateEventDetails>) {
    const {
      detail: { callback, match, pathname, self, switchUid }
    } = evt;

    if (this.#uid !== switchUid) {
      return;
    }

    evt.stopImmediatePropagation();

    if (!match) {
      callback(false);
      return;
    }

    // console.log(
    //   `Switch.#handleRouteActivateEvent: self='${self.getAttribute(
    //     "data-r4w-route"
    //   )}'`
    // );

    const routes = this.querySelectorAll(":scope > r4w-route");
    const firstRoute = Array.from(routes).find(route => {
      const routePattern = route.getAttribute("path");
      if (!routePattern) {
        return false;
      }

      const { match: routeMatch } = getPathnameData(pathname, routePattern);
      return routeMatch;
    });

    callback(firstRoute === self);
  }

  #handleSwitchUidRequestEvent(
    evt: CustomEvent<SwitchUidRequestEventDetails>
  ): void {
    const {
      detail: { callback },
      target
    } = evt;

    // Unfortunately among sibling elements listeners are invoked in the order
    // they are registered, NOT first in the element that is the ancestor of
    // the event dispatcher then the other siblings. So we have to query our
    // children to see if the target is among them, if so we claim the event
    // for this route.
    if (target instanceof HTMLElement) {
      const match = [...this.querySelectorAll(target.localName)].find(
        e => e === target
      );

      if (!match) {
        return;
      }

      // We don't want upstream switches to get this event so `stopPropagation`.
      evt.stopImmediatePropagation();

      callback(this.#uid);
    }
  }
}

if (!customElements.get(Switch.webComponentName)) {
  customElements.define(Switch.webComponentName, Switch);
}
