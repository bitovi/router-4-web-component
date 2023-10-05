import type {
  RouteMatchProps,
  ElementUidProps,
  R4WDataMap
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import type { DisconnectCallback } from "../../libs/events/event.ts";
import { receive, sendInternal } from "../../libs/events/event.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { ComponentLifecycleMixin } from "../../libs/component-lifecycle/component-lifecycle.ts";

/**
 * Incremented for each Switch instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
export class Switch
  extends ComponentLifecycleMixin(HTMLElement)
  implements ElementUidProps
{
  #disconnectRouteActivateEvent: DisconnectCallback | undefined;
  #disconnectSwitchUidRequestEvent: DisconnectCallback | undefined;
  #uid: string;
  #switch_routeActivationComplete = false;
  #switch_routeActivationMatch = false;
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
      changedProperties.includes("#switch_routeActivationComplete") ||
      changedProperties.includes("#switch_routeActivationMatch")
    ) {
      if (
        this.#switch_routeActivationComplete &&
        !this.#switch_routeActivationMatch
      ) {
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
        "#switch_routeActivationComplete",
        this.#switch_routeActivationComplete,
        false,
        next => (this.#switch_routeActivationComplete = next)
      );

      this.setState(
        "#switch_routeActivationMatch",
        this.#switch_routeActivationMatch,
        false,
        next => (this.#switch_routeActivationMatch = next)
      );
    } else {
      this.#routeSet[key].push(routeUid);

      if (routes.length <= this.#routeSet[key].length) {
        this.setState(
          "#switch_routeActivationComplete",
          this.#switch_routeActivationComplete,
          true,
          next => (this.#switch_routeActivationComplete = next)
        );
      }
    }
  }

  #connectListeners() {
    this.#disconnectRouteActivateEvent = receive(
      "r4w-route-activate",
      this.#handleRouteActivateEvent.bind(this)
    );

    this.#disconnectSwitchUidRequestEvent = receive(
      "r4w-switch-uid-request",
      this.#handleSwitchUidRequestEvent.bind(this),
      this
    );
  }

  #disconnectListeners() {
    this.#disconnectRouteActivateEvent && this.#disconnectRouteActivateEvent();
    this.#disconnectRouteActivateEvent = undefined;

    this.#disconnectSwitchUidRequestEvent &&
      this.#disconnectSwitchUidRequestEvent();
    this.#disconnectSwitchUidRequestEvent = undefined;
  }

  #handleRouteActivateEvent({
    callback,
    handled,
    match,
    pathname,
    self,
    switchUid
  }: R4WDataMap["r4w-route-activate"]) {
    if (this.#uid !== switchUid) {
      return;
    }

    handled({ stopProcessing: true });

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
        "#switch_routeActivationMatch",
        this.#switch_routeActivationMatch,
        true,
        next => (this.#switch_routeActivationMatch = next)
      );
    }

    callback(same);
  }

  #handleSwitchUidRequestEvent({
    callback,
    handled,
    source
  }: R4WDataMap["r4w-switch-uid-request"]): void {
    // Unfortunately among sibling elements listeners are invoked in the order
    // they are registered, NOT first in the element that is the ancestor of
    // the event dispatcher then the other siblings. So we have to query our
    // children to see if the target is among them, if so we claim the event
    // for this route.
    if (source) {
      const match = [...this.querySelectorAll(source.localName)].find(
        e => e === source
      );

      if (!match) {
        return;
      }

      // We don't want upstream switches to get this event so `stopProcessing`.
      handled({ stopProcessing: true });

      callback(this.#uid);
    }
  }

  #redirect() {
    const redirect = this.querySelector(":scope > r4w-redirect");
    if (!redirect) {
      return;
    }

    const to = redirect.getAttribute("to");
    to && sendInternal("r4w-link-event", { to });
  }
}

if (!customElements.get(Switch.webComponentName)) {
  customElements.define(Switch.webComponentName, Switch);
}
