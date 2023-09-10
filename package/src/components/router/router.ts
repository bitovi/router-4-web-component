import type {
  LinkEventDetails,
  RouteMatchProps,
  RouteActivationProps,
  ElementUidProps,
  PathnameChangeEventDetails
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { Redirect } from "../redirect/redirect.ts";

/**
 * Incremented for each Router instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
export class Router extends HTMLElement implements ElementUidProps {
  #connected = false;
  #uid: string;
  protected _activeRoute: RouteMatchProps | null = null;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-router-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });

    setupNavigationHandling.call(this, setPathname.bind(this));
  }

  static get webComponentName() {
    return "r4w-router";
  }

  get uid(): string {
    return this.#uid;
  }

  connectedCallback() {
    if (this.#connected) {
      return;
    }

    this.#connected = true;

    this._shadowRoot.append(create("slot"));

    addEventListenerFactory(
      "r4w-router-uid-request",
      this
    )(evt => {
      // There might be sibling elements that are routers, we don't want them to
      // get this event so use `stopImmediatePropagation`.
      evt.stopImmediatePropagation();
      const {
        detail: { callback }
      } = evt;

      callback(this.#uid);
    });

    // Need to let the DOM finish rendering the children of this router. Then
    // add the match listeners to the child Routes - these are invoked when the
    // match status changes. After that set the initial selected route.
    let id: number | undefined;
    id = requestIdleCallback(() => {
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
              // associated with the path to this router's UID.
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

      setPathname.call(this, window.location.pathname);
    });
  }
}

if (!customElements.get(Router.webComponentName)) {
  customElements.define(Router.webComponentName, Router);
}

function isRedirect(obj: Element): obj is Redirect {
  return obj.tagName === Redirect.webComponentName.toLocaleUpperCase();
}

function isRouteLike(obj: any): obj is RouteMatchProps & RouteActivationProps {
  return "addMatchListener" in obj && "activate" in obj && "deactivate" in obj;
}

async function setPathname(this: Router, pathname: string) {
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
      .map(route => (route as unknown as RouteMatchProps).setPathname(pathname))
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

function setupNavigationHandling(this: Router, onUrlChange: OnUrlChange) {
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
    // whether or not this instance of Router needs to handle or ignore the
    // event.
    window.history.pushState(this.uid, "", detail.to);
    onUrlChange(detail.to);
  });
}

interface OnUrlChange {
  (url: string): void;
}
