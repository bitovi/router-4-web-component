import { ParamsMixin } from "../../classes/params/params.ts";
import { PathnameChangedMixin } from "../../classes/pathname-changed/pathname-changed.ts";
import { LoaderMixin } from "../../classes/loader/loader.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";

/**
 * Incremented for each Route instance that's created.
 */
let uidCount = 0;

/**
 * Attributes:
 *   - path {string} The path that is cognate with the `to` attribute of a link.
 *   - src {string} The URL of the module associated with this route.
 */
export class Route extends PathnameChangedMixin(
  ParamsMixin(LoaderMixin(BasecompMixin(HTMLElement)))
) {
  #activated = false;
  #children: Element[] = [];
  #uid: string;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-route-${uidCount}`;
    this.setAttribute(this.#uid, "");
  }

  static get observedAttributes(): string[] {
    return ["path", "src"];
  }

  static get webComponentName(): string {
    return "r4w-route";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    switch (name) {
      case "path": {
        this.setState(
          "pattern",
          this.pattern,
          newValue,
          next => (this.pattern = next)
        );
        break;
      }
      case "src": {
        this.setState(
          "moduleName",
          this.moduleName,
          newValue,
          next => (this.moduleName = next)
        );
        break;
      }
    }
  }

  /******************************************************************
   * Basecomp
   *****************************************************************/
  override componentConnect(): void {
    super.componentConnect && super.componentConnect();

    // this.#handleRouteUidRequestEventBound =
    //   this.#handleRouteUidRequestEvent.bind(this);
    // addEventListenerFactory(
    //   "r4w-route-uid-request",
    //   this
    // )(this.#handleRouteUidRequestEventBound);

    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });
  }

  override componentDisconnect(): void {
    super.componentDisconnect && super.componentDisconnect();

    // this.#handleRouteUidRequestEventBound &&
    //   this.removeEventListener(
    //     "r4w-route-uid-request",
    //     this.#handleRouteUidRequestEventBound
    //   );
    // this.#handleRouteUidRequestEventBound = undefined;
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    if (changedProperties.includes("#activated") && !this.#activated) {
      this.#becomeDeactivated();
    }

    if (
      (changedProperties.includes("#activated") ||
        changedProperties.includes("#connected")) &&
      this.#activated &&
      this.connected
    ) {
      this.#becomeActivated();
    }
  }

  /******************************************************************
   * PathnameChanged
   *****************************************************************/
  override onPathnameChange(pathname: string, match: boolean): void {
    super.onPathnameChange && super.onPathnameChange(pathname, match);

    this.setState(
      "#activated",
      this.#activated,
      match,
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

  // #handleRouteUidRequestEvent(evt: Event) {
  //   if (!isRouteUidRequestEventDetails(evt)) {
  //     return;
  //   }

  //   const {
  //     detail: { callback },
  //     target
  //   } = evt;

  //   // Unfortunately among sibling elements listeners are invoked in the order
  //   // they are registered, NOT first in the element that is the ancestor of
  //   // the event dispatcher then the other siblings. So we have to query our
  //   // children to see if the target is among them, if so we claim the event
  //   // for this route.
  //   if (target instanceof HTMLElement) {
  //     const match = [...this.querySelectorAll(target.localName)].find(
  //       e => e === target
  //     );

  //     if (!match) {
  //       return;
  //     }

  //     // We don't want upstream routes to get this event so `stopPropagation`.
  //     // There are probably sibling elements that are routes, we don't want
  //     // them to get this event so use `stopImmediatePropagation`.
  //     evt.stopImmediatePropagation();

  //     const router = this.parentElement;

  //     if (isElementUidProps(router)) {
  //       callback(this.uid, router.uid);
  //     }
  //   }
  // }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}
