import type { R4WDataMap } from "../../types.ts";
import type { DisconnectCallback } from "../../libs/events/event.ts";
import { receive, receiveInternal, send } from "../../libs/events/event.ts";
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
  #disconnectNavigationEvent: DisconnectCallback | undefined;
  #disconnectPathnameRequestEvent: DisconnectCallback | undefined;
  #disconnectRouteUidRequestEvent: DisconnectCallback | undefined;
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
    this.#disconnectNavigationEvent = receiveInternal(
      "r4w-navigation-change",
      this.#handleNavigationEvent.bind(this)
    );

    this.#disconnectRouteUidRequestEvent = receive(
      "r4w-route-uid-request",
      this.#handleRouteUidRequestEvent.bind(this),
      this
    );

    this.#disconnectPathnameRequestEvent = receive(
      "r4w-pathname-request",
      this.#handlePathnameRequestEvent.bind(this),
      this
    );
  }

  #disconnectListeners() {
    this.#disconnectNavigationEvent && this.#disconnectNavigationEvent();
    this.#disconnectNavigationEvent = undefined;

    this.#disconnectRouteUidRequestEvent &&
      this.#disconnectRouteUidRequestEvent();
    this.#disconnectRouteUidRequestEvent = undefined;

    this.#disconnectPathnameRequestEvent &&
      this.#disconnectPathnameRequestEvent();
    this.#disconnectPathnameRequestEvent = undefined;
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

    send("r4w-pathname-change", {
      pathname: this.#pathname,
      pattern: this.#pattern,
      routeUid: this.#uid
    });
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
    send("r4w-route-activate", {
      callback: activatePermitted => (permitted = activatePermitted),
      match,
      pathname: this.#pathname,
      self: this,
      switchUid: this.#switchUid
    });

    return permitted;
  }

  #dispatchSwitchUidRequestEvent() {
    // If we are not in a switch then nextSwitchUid will remain `undefined`.
    let nextSwitchUid;

    send(
      "r4w-switch-uid-request",
      {
        callback: switchUid => (nextSwitchUid = switchUid)
      },
      this
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

  #handleNavigationEvent(data: R4WDataMap["r4w-navigation-change"]) {
    this.setState(
      "#pathname",
      this.#pathname,
      data.pathname,
      next => (this.#pathname = next)
    );
  }

  #handlePathnameRequestEvent({
    handled,
    routeUid
  }: R4WDataMap["r4w-pathname-request"]) {
    if (this.#uid !== routeUid) {
      return;
    }

    handled({ stopProcessing: true });

    this.#dispatchPathnameChangedEvent();
  }

  #handleRouteUidRequestEvent({
    callback,
    handled,
    source
  }: R4WDataMap["r4w-route-uid-request"]) {
    // console.log(
    //   `Route[${this.#uid}].#handleRouteUidRequestEvent: event arrived.`
    // );

    // Unfortunately among sibling elements listeners are invoked in the order
    // they are registered, NOT first in the element that is the ancestor of
    // the event dispatcher then the other siblings. So we have to query our
    // children to see if the target is among them, if so we claim the event
    // for this route.
    if (source) {
      // If a one of our mixins is firing the event the target will be us.
      let match = this === source;

      if (!match) {
        match = !![...this.querySelectorAll(source.localName)].find(
          e => e === source
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
      handled({ stopProcessing: true });

      callback(this.#uid);
    }
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
