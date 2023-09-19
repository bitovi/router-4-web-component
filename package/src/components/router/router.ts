import type { LinkEventDetails, NavigationEventDetails } from "../../types.ts";
import { ComponentLifecycleMixin } from "../../libs/component-lifecycle/component-lifecycle.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

const HISTORY_STATE = "r4w-router";

export class Router extends ComponentLifecycleMixin(HTMLElement) {
  #handleLinkEventBound:
    | ((evt: CustomEvent<LinkEventDetails>) => void)
    | undefined;
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

    this.#handleLinkEventBound = this.#handleLinkEvent.bind(this);
    addEventListenerFactory("r4w-link-event", this)(this.#handleLinkEventBound);
  }

  #disconnectListeners() {
    this.#handlePopStateBound &&
      window.removeEventListener("popstate", this.#handlePopStateBound);
    this.#handlePopStateBound = undefined;

    this.#handleLinkEventBound &&
      this.removeEventListener(
        "r4w-link-event",
        this.#handleLinkEventBound as (evt: Event) => void
      );
    this.#handleLinkEventBound = undefined;
  }

  #dispatchNavigationEvent(pathname: string) {
    window.dispatchEvent(
      new CustomEvent<NavigationEventDetails>("r4w-navigation-change", {
        detail: { pathname }
      })
    );
  }

  #handleLinkEvent(evt: CustomEvent<LinkEventDetails>) {
    evt.stopPropagation();
    const { detail } = evt;

    // We add our `uid` so that later when popstate events occur we know
    // whether or not this instance of switch needs to handle or ignore the
    // event.
    window.history.pushState(HISTORY_STATE, "", detail.to);
    this.#dispatchNavigationEvent(detail.to);
  }

  #handlePopState(evt: PopStateEvent) {
    // Ignore popstate events that don't include this instance's state..
    evt.state === HISTORY_STATE &&
      this.#dispatchNavigationEvent(window.location.pathname);
  }
}

if (!customElements.get(Router.webComponentName)) {
  customElements.define(Router.webComponentName, Router);
}
