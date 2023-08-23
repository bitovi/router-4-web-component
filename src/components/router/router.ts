import { builder } from "../../libs/elementBuilder/elementBuilder.ts";
import type {
  LinkEventDetails,
  RouteMatchProps,
  RouteActivationProps,
  RouterProps
} from "../../types.ts";
import type { RedirectProps } from "../redirect/redirect.ts";
import { Redirect } from "../redirect/redirect.ts";
import { Route } from "../route/route.ts";

/**
 * Incremented for each Router instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
class Router extends HTMLElement implements RouterProps {
  private _shadowRoot: ShadowRoot;
  private _uid: string | undefined;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this._uid = `r4w-router-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(builder.create("slot"));

    function handleUrlChange(url: string) {
      const children: Route[] =
        this._shadowRoot.childNodes[0].assignedElements();
      if (!children.length) {
        return;
      }

      for (const child of children) {
        if (isRouteLike(child)) {
          if (child.matchPath(url)) {
            child.activate();
          } else {
            child.deactivate();
          }
        }
      }
    }

    setupNavigationHandling.call(this, handleUrlChange.bind(this));
  }

  static get webComponentName() {
    return "r4w-router";
  }

  get uid(): string {
    return this._uid;
  }

  connectedCallback() {
    // Need to let the DOM finish rendering the children of this router, then
    // determine if there is currently a path available and if so activate it,
    // otherwise if there is a redirect navigate to it.
    requestIdleCallback(() => {
      const children = (
        this._shadowRoot.childNodes[0] as HTMLSlotElement
      ).assignedElements();

      let matched = false;
      let redirect: RedirectProps | undefined;
      if (children?.length) {
        for (const child of children) {
          if (isRouteLike(child)) {
            const childMatch = child.matchPath(window.location.pathname);
            childMatch && child.activate();
            matched = matched || childMatch;
          } else if (!redirect && isRedirect(child)) {
            redirect = child;
          }
        }
      }

      if (!matched) {
        if (redirect) {
          window.history.pushState({}, "", redirect.to);
        }
      }
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
  return "matchPath" in obj && "activate" in obj && "deactivate" in obj;
}

function setupNavigationHandling(this: Router, onUrlChange: OnUrlChange) {
  window.addEventListener("popstate", (evt: PopStateEvent) => {
    // Ignore popstate events that don't include this instance's `uid`.
    evt.state === this.uid && onUrlChange(window.location.pathname);
  });

  window.addEventListener(
    "r4w-link-event",
    ({ detail }: CustomEvent<LinkEventDetails>) => {
      if (detail.routerUid !== this.uid) {
        return;
      }

      // We add our `uid` so that later when popstate events occur we know
      // whether or not this instance of Router needs to handle or ignore the
      // event.
      window.history.pushState(this.uid, "", detail.to);
      onUrlChange(detail.to);
    }
  );
}

interface OnUrlChange {
  (url: string): void;
}
