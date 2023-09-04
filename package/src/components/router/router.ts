import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import type {
  LinkEventDetails,
  RouteMatchProps,
  RouteActivationProps,
  ElementUidProps
} from "../../types.ts";
import { Redirect } from "../redirect/redirect.ts";

/**
 * Incremented for each Router instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
class Router extends HTMLElement implements ElementUidProps {
  private _connected = false;
  private _uid: string;
  protected _activeRoute: RouteMatchProps | null = null;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this._uid = `r4w-router-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });

    setupNavigationHandling.call(this, setPathname.bind(this));
  }

  static get webComponentName() {
    return "r4w-router";
  }

  get uid(): string {
    return this._uid;
  }

  connectedCallback() {
    if (this._connected) {
      return;
    }

    this._connected = true;

    this._shadowRoot.append(create("slot"));

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

export { Router };

function isRedirect(obj: Element): obj is Redirect {
  return obj.tagName === Redirect.webComponentName.toLocaleUpperCase();
}

function isRouteLike(obj: any): obj is RouteMatchProps & RouteActivationProps {
  return "addMatchListener" in obj && "activate" in obj && "deactivate" in obj;
}

async function setPathname(this: Router, pathname: string) {
  const children = (
    this._shadowRoot.childNodes[0] as HTMLSlotElement
  ).assignedElements();

  if (!children.length) {
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

  if (!this._activeRoute) {
    const redirect = children.find(child => isRedirect(child)) as Redirect;

    if (redirect?.to) {
      window.dispatchEvent(
        new CustomEvent<LinkEventDetails>("r4w-link-event", {
          detail: { routerUid: this.uid, to: redirect.to }
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

  window.addEventListener("r4w-link-event", evt => {
    const { detail } = evt as CustomEvent<LinkEventDetails>;
    if (detail.routerUid !== this.uid) {
      return;
    }

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
