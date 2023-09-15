import type {
  LinkEventDetails,
  RouteMatchProps,
  RouteActivationProps,
  ElementUidProps,
  PathnameChangeEventDetails,
  SwitchUidRequestEventDetails
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { Redirect } from "../redirect/redirect.ts";

/**
 * Incremented for each Switch instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
export class Switch extends HTMLElement implements ElementUidProps {
  #connected = false;
  #handleSwitchUidRequestEventBound: ((evt: Event) => void) | undefined;
  #init = false;
  #uid: string;
  protected _activeRoute: RouteMatchProps | null = null;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-switch-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });

    this.#setupNavigationHandling(this.#setPathname.bind(this));
  }

  static get webComponentName(): string {
    return "r4w-switch";
  }

  get uid(): string {
    return this.#uid;
  }

  connectedCallback(): void {
    if (this.#connected) {
      return;
    }

    this.#connected = true;

    this._componentInitialConnect();

    this.#handleSwitchUidRequestEventBound =
      this.#handleSwitchUidRequestEvent.bind(this);

    addEventListenerFactory(
      "r4w-switch-uid-request",
      this
    )(this.#handleSwitchUidRequestEventBound);

    // Need to let the DOM finish rendering the children of this switch. Then
    // add the match listeners to the child Routes - these are invoked when the
    // match status changes. After that set the initial selected route.
    const id = requestIdleCallback(() => {
      id && cancelIdleCallback(id);
      const children = (
        this._shadowRoot.childNodes[0] as HTMLSlotElement
      ).assignedElements();

      for (const child of children) {
        if (isRouteLike(child)) {
          child.addMatchListener(match => {
            if (match) {
              this._activeRoute = child;
              // Do not `await` activate, just keep going so all the routes are
              // updated in the same tick.
              child.activate();

              // On initial page load if the path is empty or "/" and a route
              // handles that path the browser will display the page without a
              // navigation event, in such a case we need to set the state
              // associated with the path to this switch's UID.
              !window.history.state &&
                window.history.replaceState(this.uid, "");
            } else {
              this._activeRoute =
                this._activeRoute !== child ? this._activeRoute : null;
              child.deactivate();
            }
          });
        }
      }

      this.#setPathname(window.location.pathname);
    });
  }

  disconnectedCallback(): void {
    this.#handleSwitchUidRequestEventBound &&
      this.removeEventListener(
        "r4w-switch-uid-request",
        this.#handleSwitchUidRequestEventBound
      );

    this.#handleSwitchUidRequestEventBound = undefined;
  }

  /**
   * Override to make changes only the very first time the component is
   * connected.
   * @protected
   */
  _componentInitialConnect(): void {
    if (this.#init) {
      return;
    }

    this.#init = true;

    this._shadowRoot.append(create("slot"));
  }

  #handleSwitchUidRequestEvent(evt: Event): void {
    if (!isSwitchUidRequestEventDetails(evt)) {
      return;
    }

    // We don't want upstream routers to get this event so `stopPropagation`.
    // There might be sibling elements that are routers, we don't want them to
    // get this event so use `stopImmediatePropagation`.
    evt.stopImmediatePropagation();

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

      // There are probably sibling elements that are routes, we don't want
      // them to get this event so use `stopImmediatePropagation`.
      evt.stopImmediatePropagation();

      callback(this.#uid);
    }
  }

  async #setPathname(pathname: string) {
    const children = (
      this._shadowRoot.firstElementChild as HTMLSlotElement
    ).assignedElements();

    if (!children?.length) {
      return;
    }

    // setPathname only resolves once all the pathname change listeners for that
    // route have been invoked with the new pathname. We wait for everything to
    // resolve then, if no route is active, and there is a redirect, fire a change
    // event with the redirect's `to` value.
    await Promise.all(
      children
        .filter(child => isRouteLike(child))
        .map(route =>
          (route as unknown as RouteMatchProps).setPathname(pathname)
        )
    );

    // May want this to fire only when there is an `_activeRoute`...
    window.dispatchEvent(
      new CustomEvent<PathnameChangeEventDetails>("r4w-pathname-change", {
        detail: { pathname, routerUid: this.uid }
      })
    );

    if (!this._activeRoute) {
      const redirect = children.find(child => isRedirect(child)) as Redirect;

      if (redirect?.to) {
        this.dispatchEvent(
          new CustomEvent<LinkEventDetails>("r4w-link-event", {
            bubbles: true,
            composed: true,
            detail: { to: redirect.to }
          })
        );
      }
    }
  }

  #setupNavigationHandling(onUrlChange: OnUrlChange) {
    window.addEventListener("popstate", (evt: PopStateEvent) => {
      // Ignore popstate events that don't include this instance's `uid`.
      evt.state === this.uid && onUrlChange(window.location.pathname);
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
      window.history.pushState(this.uid, "", detail.to);
      onUrlChange(detail.to);
    });
  }
}

if (!customElements.get(Switch.webComponentName)) {
  customElements.define(Switch.webComponentName, Switch);
}

function isRedirect(obj: Element): obj is Redirect {
  return obj.tagName === Redirect.webComponentName.toLocaleUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRouteLike(obj: any): obj is RouteMatchProps & RouteActivationProps {
  return "addMatchListener" in obj && "activate" in obj && "deactivate" in obj;
}

function isSwitchUidRequestEventDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt: any
): evt is CustomEvent<SwitchUidRequestEventDetails> {
  return evt && "detail" in evt && "callback" in evt.detail;
}

interface OnUrlChange {
  (url: string): void;
}