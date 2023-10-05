import type { R4WDataMap } from "../../types.ts";
import { ComponentLifecycleMixin } from "../../libs/component-lifecycle/component-lifecycle.ts";
import type { DisconnectCallback } from "../../libs/events/event.ts";
import { receiveInternal, sendInternal } from "../../libs/events/event.ts";

const HISTORY_STATE = "r4w-router";

export class Router extends ComponentLifecycleMixin(HTMLElement) {
  #disconnectLinkEvent: DisconnectCallback | undefined;
  #handlePopStateBound: ((evt: PopStateEvent) => void) | undefined;

  constructor() {
    super();
  }

  static get webComponentName(): string {
    return "r4w-router";
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

  /******************************************************************
   * private
   *****************************************************************/

  #connectListeners() {
    this.#handlePopStateBound = this.#handlePopState.bind(this);
    window.addEventListener("popstate", this.#handlePopStateBound);

    this.#disconnectLinkEvent = receiveInternal(
      "r4w-link-event",
      this.#handleLinkEvent.bind(this)
    );
  }

  #disconnectListeners() {
    this.#handlePopStateBound &&
      window.removeEventListener("popstate", this.#handlePopStateBound);
    this.#handlePopStateBound = undefined;

    this.#disconnectLinkEvent && this.#disconnectLinkEvent();
    this.#disconnectLinkEvent = undefined;
  }

  #handleLinkEvent({ handled, to }: R4WDataMap["r4w-link-event"]) {
    handled({ stopPropagation: true });

    // We don't really need to store anything in state but we do just because we
    // used to.
    window.history.pushState(HISTORY_STATE, "", to);
    sendInternal("r4w-navigation-change", { pathname: to });
  }

  #handlePopState(evt: PopStateEvent) {
    sendInternal("r4w-navigation-change", {
      pathname: window.location.pathname
    });
  }
}

if (!customElements.get(Router.webComponentName)) {
  customElements.define(Router.webComponentName, Router);
}
