import type {
  NavigationEventDetails,
  PathnameChangeEventDetails,
  PathnameRequestEventDetails,
  RouteActivateEventDetails,
  RouteUidRequestEventDetails,
  SwitchUidRequestEventDetails
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { ComponentLifecycleMixin } from "../../libs/component-lifecycle/component-lifecycle.ts";
import { LoaderMixin } from "../../mixins/loader/loader.ts";
import { RouteMixin } from "../../mixins/route/route.ts";
import { PathnameMixin } from "../../mixins/pathname/pathname.ts";
import { ParamsMixin } from "../../mixins/params/params.ts";

/**
 * Incremented for each Route instance that's created.
 */
let uidCount = 0;

/**
 * Attributes:
 *   - path {string} The path that is cognate with the `to` attribute of a link.
 *   - src {string} Optional URL of a module to fetch when this route is activated.
 */
export class Route extends ParamsMixin(
  PathnameMixin(RouteMixin(LoaderMixin(ComponentLifecycleMixin(HTMLElement))))
) {
  #activated = false;
  #children: Element[] = [];
  #handleNavigationEventBound:
    | ((evt: CustomEvent<NavigationEventDetails>) => void)
    | undefined;
  #handlePathnameRequestEventBound:
    | ((evt: CustomEvent<PathnameRequestEventDetails>) => void)
    | undefined;
  #handleRouteUidRequestEventBound:
    | ((evt: CustomEvent<RouteUidRequestEventDetails>) => void)
    | undefined;
  #pattern: string | undefined;
  #pathname: string | undefined;
  #switchUid: string | undefined;
  #uid: string;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-route-${uidCount}`;
  }

  static get observedAttributes(): string[] {
    return ["path", "src"];
  }

  static get webComponentName(): string {
    return "r4w-route";
  }

  override attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    super.attributeChangedCallback &&
      super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case "path": {
        this.setState(
          "#pattern",
          this.#pattern,
          newValue,
          next => (this.#pattern = next)
        );

        break;
      }
    }
  }

  /******************************************************************
   * Basecomp
   *****************************************************************/
  override componentInitialConnect(): void {
    this.setAttribute("data-r4w-route", this.#uid);
  }

  override componentConnect(): void {
    super.componentConnect && super.componentConnect();

    // console.trace(`Route[${this.#uid}].componentConnect`);

    this.#connectListeners();

    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });

    // Let all the componentConnect methods be invoked (they probably set
    // listeners) then dispatch a request for a switch UID.
    setTimeout(() => this.#dispatchSwitchUidRequestEvent(), 0);
  }

  override componentDisconnect(): void {
    super.componentDisconnect && super.componentDisconnect();
    this.#disconnectListeners();
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    // console.log(
    //   `Route[${this.#uid}].update: changedProperties='${changedProperties.join(
    //     ", "
    //   )}'`
    // );

    if (changedProperties.includes("#activated")) {
      this.#activated ? this.#becomeActivated() : this.#becomeDeactivated();
    }

    if (
      changedProperties.includes("lifecycle_connected") ||
      changedProperties.includes("match")
    ) {
      this.setState(
        "#activated",
        this.#activated,
        this.connected && this.match,
        next => (this.#activated = !!next)
      );
    }

    if (
      changedProperties.includes("#pathname") ||
      changedProperties.includes("#pattern")
    ) {
      this.#activateIfMatchAndPermitted();
      this.#dispatchPathnameChangedEvent();
    }

    if (changedProperties.includes("#switchUid")) {
      this.#setInitialPathname();
    }
  }

  /******************************************************************
   * private
   *****************************************************************/

  #activateIfMatchAndPermitted() {
    if (!this.#pathname || !this.#pattern) {
      return;
    }

    const { match } = getPathnameData(this.#pathname, this.#pattern);

    // match && console.trace(`Route[${this.#uid}].#activateIfMatchAndPermitted.`);

    const permitted = this.#switchUid
      ? this.#dispatchRouteActivateEvent(match)
      : true;

    this.setState(
      "#activated",
      this.#activated,
      match && permitted,
      next => (this.#activated = next)
    );
  }

  async #becomeActivated(): Promise<void> {
    // `#children` contains the elements to be presented when the route is
    // active.
    this.append(...this.#children);
    this.#children.length = 0;

    // When the loader is activated, and it hasn't already downloaded the
    // module, it downloads the module.
    await this.activate();
  }

  #becomeDeactivated(): void {
    // Remove the route children from the display. We could in the future allow
    // the client to "release" the slot and module to free up memory then fetch
    // and attach them again when needed.
    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });

    this.deactivate();
  }

  #connectListeners() {
    this.#handleNavigationEventBound = this.#handleNavigationEvent.bind(this);
    addEventListenerFactory(
      "r4w-navigation-change",
      window
    )(this.#handleNavigationEventBound);

    this.#handleRouteUidRequestEventBound =
      this.#handleRouteUidRequestEvent.bind(this);
    addEventListenerFactory(
      "r4w-route-uid-request",
      this
    )(this.#handleRouteUidRequestEventBound);

    this.#handlePathnameRequestEventBound =
      this.#handlePathnameRequestEvent.bind(this);
    addEventListenerFactory(
      "r4w-pathname-request",
      this
    )(this.#handlePathnameRequestEventBound);
  }

  #disconnectListeners() {
    this.#handleNavigationEventBound &&
      window.removeEventListener(
        "r4w-navigation-change",
        this.#handleNavigationEventBound as (evt: Event) => void
      );

    this.#handleNavigationEventBound = undefined;

    this.#handleRouteUidRequestEventBound &&
      this.removeEventListener(
        "r4w-route-uid-request",
        this.#handleRouteUidRequestEventBound as (evt: Event) => void
      );

    this.#handleRouteUidRequestEventBound = undefined;

    this.#handlePathnameRequestEventBound &&
      this.removeEventListener(
        "r4w-pathname-request",
        this.#handlePathnameRequestEventBound as (evt: Event) => void
      );

    this.#handlePathnameRequestEventBound = undefined;
  }

  #dispatchPathnameChangedEvent() {
    if (!this.#pathname || !this.#pattern) {
      return;
    }

    // console.log(
    //   `Route[${
    //     this.#uid
    //   }].#dispatchPathnameChangedEvent: dispatching; pathname='${
    //     this.#pathname
    //   }', pattern='${this.#pattern}', uid='${this.#uid}'`
    // );

    window.dispatchEvent(
      new CustomEvent<PathnameChangeEventDetails>("r4w-pathname-change", {
        detail: {
          pathname: this.#pathname,
          pattern: this.#pattern,
          routeUid: this.#uid
        }
      })
    );
  }

  #dispatchRouteActivateEvent(match: boolean): boolean {
    // Routes not inside a switch always activate.
    if (!this.#switchUid) {
      return true;
    }

    if (!this.#pathname || !this.#pattern) {
      return false;
    }

    let permitted = false;
    window.dispatchEvent(
      new CustomEvent<RouteActivateEventDetails>("r4w-route-activate", {
        bubbles: true,
        composed: true,
        detail: {
          callback: activatePermitted => (permitted = activatePermitted),
          match,
          pathname: this.#pathname,
          self: this,
          switchUid: this.#switchUid
        }
      })
    );

    return permitted;
  }

  #dispatchSwitchUidRequestEvent() {
    // If we are not in a switch then nextSwitchUid will remain `undefined`.
    let nextSwitchUid;

    this.dispatchEvent(
      new CustomEvent<SwitchUidRequestEventDetails>("r4w-switch-uid-request", {
        bubbles: true,
        composed: true,
        detail: {
          callback: switchUid => (nextSwitchUid = switchUid)
        }
      })
    );

    if (nextSwitchUid) {
      this.setState(
        "#switchUid",
        this.#switchUid,
        nextSwitchUid,
        next => (this.#switchUid = next)
      );
    } else {
      this.#setInitialPathname();
    }
  }

  #handleNavigationEvent(evt: CustomEvent<NavigationEventDetails>) {
    this.setState(
      "#pathname",
      this.#pathname,
      evt.detail.pathname,
      next => (this.#pathname = next)
    );
  }

  #handlePathnameRequestEvent(evt: CustomEvent<PathnameRequestEventDetails>) {
    if (this.#uid !== evt.detail.routeUid) {
      return;
    }

    evt.stopImmediatePropagation();

    this.#dispatchPathnameChangedEvent();
  }

  #handleRouteUidRequestEvent(evt: CustomEvent<RouteUidRequestEventDetails>) {
    // console.log(
    //   `Route[${this.#uid}].#handleRouteUidRequestEvent: event arrived.`
    // );

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
      // If a one of our mixins is firing the event the target will be us.
      let match = this === target;

      if (!match) {
        match = !![...this.querySelectorAll(target.localName)].find(
          e => e === target
        );
      }

      if (!match) {
        return;
      }

      // console.log(
      //   `Route[${this.#uid}].#handleRouteUidRequestEvent: responding.`
      // );

      // We don't want upstream routes to get this event so `stopPropagation`.
      // There are probably sibling elements that are routes, we don't want
      // them to get this event so use `stopImmediatePropagation`.
      evt.stopImmediatePropagation();

      callback(this.#uid);
    }
  }

  #mapPropertyToValue(property: string): unknown {
    let value;

    switch (property) {
      case "#activated": {
        value = this.#activated;
        break;
      }
      case "#uid": {
        value = this.#uid;
        break;
      }
      case "#pathname": {
        value = this.#pathname;
        break;
      }
      case "#pattern": {
        value = this.#pattern;
        break;
      }
      case "#switchUid": {
        value = this.#switchUid;
        break;
      }
    }

    return value;
  }

  #setInitialPathname() {
    if (this.#pathname) {
      return;
    }

    // Set the initial pathname.
    this.setState(
      "#pathname",
      this.#pathname,
      window.location.pathname,
      next => (this.#pathname = next)
    );
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}
