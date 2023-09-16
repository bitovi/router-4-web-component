import type { PathnameChangeEventDetails } from "../../types.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

const HISTORY_STATE = "r4w-router";

export class Router extends BasecompMixin(HTMLElement) {
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
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();

    window.addEventListener("popstate", (evt: PopStateEvent) => {
      // Ignore popstate events that don't include this instance's state..
      evt.state === HISTORY_STATE &&
        this.#dispatchPathChangeEvent(window.location.pathname);
    });

    addEventListenerFactory(
      "r4w-link-event",
      this
    )(evt => {
      evt.stopPropagation();
      const { detail } = evt;

      // We add our `uid` so that later when popstate events occur we know
      // whether or not this instance of switch needs to handle or ignore the
      // event.
      window.history.pushState(HISTORY_STATE, "", detail.to);
      this.#dispatchPathChangeEvent(detail.to);
    });
  }

  override componentDisconnect(): void {
    super.componentDisconnect();
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);
  }

  #dispatchPathChangeEvent(pathname: string) {
    window.dispatchEvent(
      new CustomEvent<PathnameChangeEventDetails>("r4w-pathname-change", {
        detail: { pathname }
      })
    );
  }
}

if (!customElements.get(Router.webComponentName)) {
  customElements.define(Router.webComponentName, Router);
}
