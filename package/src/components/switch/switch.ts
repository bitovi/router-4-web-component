import type {
  RouteMatchProps,
  ElementUidProps,
  SwitchUidRequestEventDetails,
  RouteActivateEventDetails,
  LinkEventDetails
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";

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
  #routeActivationComplete = false;
  #routeActivationMatch = false;
  #routeSet: { [id: string]: string[] } = {};
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

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    if (
      changedProperties.includes("#routeActivationComplete") ||
      changedProperties.includes("#routeActivationMatch")
    ) {
      if (this.#routeActivationComplete && !this.#routeActivationMatch) {
        // console.log("Switch.update: needs redirect.");
        this.#redirect();
      }
    }
  }

  /******************************************************************
   * private
   *****************************************************************/

  #addRouteToRouteSet(routes: NodeListOf<Element>, routeUid: string) {
    if (!Object.keys(this.#routeSet).length) {
      // console.log("Switch.#addRouteToRouteSet: no keys, setting to '0'.");
      this.#routeSet["0"] = [];
    }

    const [key] = Object.keys(this.#routeSet);
    // console.log(
    //   `Switch.#addRouteToRouteSet: key='${key}', routeUid='${routeUid}'.`
    // );

    if (this.#routeSet[key].includes(routeUid)) {
      delete this.#routeSet[key];

      this.#routeSet[`${+key + 1}`] = [routeUid];
      // console.log(
      //   `Switch.#addRouteToRouteSet: deleted key; new key='${
      //     Object.keys(this.#routeSet)[0]
      //   }', routeUid='${routeUid}'.`
      // );

      this.setState(
        "#routeActivationComplete",
        this.#routeActivationComplete,
        false,
        next => (this.#routeActivationComplete = next)
      );

      this.setState(
        "#routeActivationMatch",
        this.#routeActivationMatch,
        false,
        next => (this.#routeActivationMatch = next)
      );
    } else {
      this.#routeSet[key].push(routeUid);

      if (routes.length <= this.#routeSet[key].length) {
        this.setState(
          "#routeActivationComplete",
          this.#routeActivationComplete,
          true,
          next => (this.#routeActivationComplete = next)
        );
      }
    }
  }

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

    // console.log(
    //   `Switch.#handleRouteActivateEvent: self='${self.getAttribute(
    //     "data-r4w-route"
    //   )}'`
    // );

    const routes = this.querySelectorAll(":scope > r4w-route");

    const selfRouteUid = self.getAttribute("data-r4w-route");
    selfRouteUid && this.#addRouteToRouteSet(routes, selfRouteUid);

    if (!match) {
      callback(false);
      return;
    }

    const firstRoute = Array.from(routes).find(route => {
      const routePattern = route.getAttribute("path");
      if (!routePattern) {
        return false;
      }

      const { match: routeMatch } = getPathnameData(pathname, routePattern);
      return routeMatch;
    });

    const same = firstRoute === self;

    if (same) {
      this.setState(
        "#routeActivationMatch",
        this.#routeActivationMatch,
        true,
        next => (this.#routeActivationMatch = next)
      );
    }

    callback(same);
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

  #redirect() {
    const redirect = this.querySelector(":scope > r4w-redirect");
    if (!redirect) {
      return;
    }

    const to = redirect.getAttribute("to");
    to &&
      window.dispatchEvent(
        new CustomEvent<LinkEventDetails>("r4w-link-event", {
          bubbles: true,
          composed: true,
          detail: { to }
        })
      );
  }
}

if (!customElements.get(Switch.webComponentName)) {
  customElements.define(Switch.webComponentName, Switch);
}
