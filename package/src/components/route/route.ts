import type {
  ElementUidProps,
  ParamsChangeEventDetails,
  RouteActivationProps,
  RouteMatchProps,
  RouteUidRequestEventDetails,
  WebComponent
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { Pathname } from "../../classes/pathname/pathname.ts";
import { Loader } from "../../classes/loader/loader.ts";

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
  extends HTMLElement
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
  #loader: Loader;
  #pathname: Pathname;
  #uid: string;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-route-${uidCount}`;
    this.setAttribute(this.#uid, "");

    this.#active = false;
    this.#loader = new Loader();
    this.#pathname = new Pathname();
  }

  static get observedAttributes(): string[] {
    return ["path", "src"];
  }

  static get webComponentName() {
    return "r4w-route";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    switch (name) {
      case "path": {
        this.#pathname.pattern = newValue;
      }
      case "src": {
        this.#loader.moduleName = newValue;
        break;
      }
    }
  }

  connectedCallback() {
    if (this.#connected) {
      return;
    }

    this.#connected = true;

    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });

    this.#handleRouteUidRequestEventBound =
      this.#handleRouteUidRequestEvent.bind(this);

    addEventListenerFactory(
      "r4w-route-uid-request",
      this
    )(this.#handleRouteUidRequestEventBound);
  }

  disconnectedCallback() {
    this.#handleRouteUidRequestEventBound &&
      this.removeEventListener(
        "r4w-route-uid-request",
        this.#handleRouteUidRequestEventBound
      );

    this.#handleRouteUidRequestEventBound = undefined;
  }

  /******************************************************************
   * ElementUidProps
   *****************************************************************/
  get uid(): string {
    return this.#uid;
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  async activate() {
    if (this.#active) {
      return;
    }

    this.#active = true;

    // `#children` contains the elements to be presented when the route is
    // active.
    this.append(...this.#children);
    this.#children.length = 0;

    // When the loader is activated, and it hasn't already downloaded the
    // module, it downloads the module.
    await this.#loader.activate();

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

  deactivate() {
    if (!this.#active) {
      return;
    }

    this.#active = false;

    // Remove the route children from the display. We could in the future allow
    // the client to "release" the slot and module to free up memory then fetch
    // and attach them again when needed.
    Array.from(this.children).forEach(element => {
      this.#children.push(element);
      element.remove();
    });

    this.#loader.deactivate();
  }

  /******************************************************************
   * RouteMatch
   *****************************************************************/
  setPathname(pathname: string): Promise<void> {
    return Promise.resolve(this.#pathname?.setPathname(pathname));
  }

  addMatchListener(
    onMatch: Parameters<RouteMatchProps["addMatchListener"]>[0]
  ) {
    this.#pathname?.addMatchChangeListener(data => {
      // TODO: don't save these, change the Pathname interface so that we can
      // invoke a method at any time to get the params.
      this.#lastParams = data.params;

      onMatch(data.match);
    });
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

function isElementUidProps(obj: any): obj is ElementUidProps {
  return obj && "uid" in obj;
}

function isRouteUidRequestEventDetails(
  evt: any
): evt is CustomEvent<RouteUidRequestEventDetails> {
  return evt && "detail" in evt && "callback" in evt.detail;
}
