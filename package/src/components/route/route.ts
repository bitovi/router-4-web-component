import type {
  ElementUidProps,
  ParamsChangeEventDetails,
  RouteActivationProps,
  RouteMatchProps,
  RouteUidRequestEventDetails,
  WebComponent
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { PathnameMixin } from "../../classes/pathname/pathname.ts";
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
export class Route
  extends BasecompMixin(PathnameMixin(LoaderMixin(HTMLElement)))
  implements
    ElementUidProps,
    RouteActivationProps,
    RouteMatchProps,
    WebComponent
{
  #active: boolean;
  #children: Element[] = [];
  #connected = false;
  #handleRouteUidRequestEventBound: ((evt: Event) => void) | undefined;
  #lastParams: Record<string, string> | undefined;
  // #pathname: Pathname;
  #uid: string;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-route-${uidCount}`;
    this.setAttribute(this.#uid, "");

    this.#active = false;
    // this.#pathname = new Pathname();
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
        this.pattern = newValue;
        break;
      }
      case "src": {
        this.moduleName = newValue;
        break;
      }
    }
  }

  override componentConnect(): void {
    this.#handleRouteUidRequestEventBound =
      this.#handleRouteUidRequestEvent.bind(this);

    addEventListenerFactory(
      "r4w-route-uid-request",
      this
    )(this.#handleRouteUidRequestEventBound);
  }

  override componentInitialConnect(): void {
    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });
  }

  override componentDisconnect(): void {
    this.#handleRouteUidRequestEventBound &&
      this.removeEventListener(
        "r4w-route-uid-request",
        this.#handleRouteUidRequestEventBound
      );

    this.#handleRouteUidRequestEventBound = undefined;
  }

  override update(changedProperties: string[]): void {
    // TODO
  }

  /******************************************************************
   * ElementUidProps
   *****************************************************************/
  get uid(): string {
    return this.#uid;
  }

  /******************************************************************
   * RouteActivationProps
   *****************************************************************/
  override async activate(): Promise<void> {
    await super.activate();

    if (this.#active) {
      return;
    }

    this.#active = true;
    return this.#becomeActivated();
  }

  override deactivate(): void {
    super.deactivate();

    if (!this.#active) {
      return;
    }

    this.#active = false;
    this.#becomeDeactivated();
  }

  /******************************************************************
   * RouteMatchProps
   *****************************************************************/
  override setPathname(pathname: string): Promise<void> {
    return super.setPathname(pathname);
  }

  addMatchListener(
    onMatch: Parameters<RouteMatchProps["addMatchListener"]>[0]
  ): void {
    this.addMatchChangeListener(data => {
      this.#lastParams = data.params;
      onMatch(data.match);
    });
  }

  async #becomeActivated(): Promise<void> {
    // `#children` contains the elements to be presented when the route is
    // active.
    this.append(...this.#children);
    this.#children.length = 0;

    // When the loader is activated, and it hasn't already downloaded the
    // module, it downloads the module.
    await this.activate();

    // Have the params changed? If so fire off an event.
    const router = this.parentElement;

    if (isElementUidProps(router)) {
      const evt = new CustomEvent<ParamsChangeEventDetails>(
        "r4w-params-change",
        {
          bubbles: true,
          composed: true,
          detail: {
            params: this.#lastParams ?? {},
            routerUid: router.uid,
            routeUid: this.uid
          }
        }
      );

      window.dispatchEvent(evt);
    }
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

  #handleRouteUidRequestEvent(evt: Event) {
    if (!isRouteUidRequestEventDetails(evt)) {
      return;
    }

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

      // We don't want upstream routes to get this event so `stopPropagation`.
      // There are probably sibling elements that are routes, we don't want
      // them to get this event so use `stopImmediatePropagation`.
      evt.stopImmediatePropagation();

      const router = this.parentElement;

      if (isElementUidProps(router)) {
        callback(this.uid, router.uid);
      }
    }
  }
}

if (!customElements.get(Route.webComponentName)) {
  customElements.define(Route.webComponentName, Route);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isElementUidProps(obj: any): obj is ElementUidProps {
  return obj && "uid" in obj;
}

function isRouteUidRequestEventDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt: any
): evt is CustomEvent<RouteUidRequestEventDetails> {
  return evt && "detail" in evt && "callback" in evt.detail;
}
