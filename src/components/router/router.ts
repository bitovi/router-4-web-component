import type { Redirector } from "../redirect/redirect.ts";
import { Redirect } from "../redirect/redirect.ts";
import { Route } from "../route/route.ts";

/**
 * The base element for routing.
 */
class Router extends HTMLElement {
  _shadowRoot: ShadowRoot;

  constructor() {
    super();

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(document.createElement("slot"));

    function handleUrlChange(url: string) {
      const children: Route[] =
        this._shadowRoot.childNodes[0].assignedElements();
      if (!children.length) {
        return;
      }

      for (const child of children) {
        if (child.matchPath) {
          if (child.matchPath(url)) {
            child.activate && child.activate();
          } else {
            child.deactivate && child.deactivate();
          }
        }
      }
    }

    setupNavigationHandling(handleUrlChange.bind(this));
  }

  static get webComponentName() {
    return "r4w-router";
  }

  connectedCallback() {
    // Determine if there is currently a path available and if so activate it,
    // otherwise if there is a redirect navigate to it.
    const children = (
      this._shadowRoot.childNodes[0] as HTMLSlotElement
    ).assignedElements() as Route[] | Redirect[];

    let matched = false;
    let redirect: Redirector | undefined;
    if (children?.length) {
      for (const child of children) {
        if (isRoute(child)) {
          const childMatch = child.matchPath(window.location.pathname);
          childMatch && child.activate();
          matched = matched || childMatch;
        } else if (
          !redirect &&
          child.tagName === Redirect.webComponentName.toLocaleUpperCase()
        ) {
          redirect = child;
        }
      }
    }

    if (!matched) {
      if (redirect) {
        window.history.pushState({}, "", redirect.to);
      }
    }
  }
}

if (!customElements.get(Router.webComponentName)) {
  customElements.define(Router.webComponentName, Router);
}

export { Router };

function setupNavigationHandling(onUrlChange: OnUrlChange) {
  window.addEventListener("popstate", () => {
    onUrlChange(window.location.pathname);
  });

  // Create a proxy for `pushState`.
  if (!(window.history.pushState as PushStateProxy)._isProxy) {
    const handler: ProxyHandler<PushStateProxy> = {
      apply: (target, thisArg, [state, , url]) => {
        const result = target.apply(thisArg, [state, "", url]);
        onUrlChange(url);
        return result;
      },
      get: (target, propertyKey, receiver) => {
        if (propertyKey === "_isProxy") {
          return true;
        }

        return Reflect.get(target, propertyKey, receiver);
      }
    };

    window.history.pushState = new Proxy(window.history.pushState, handler);
  }
}

function isRoute(obj: HTMLElement): obj is Route {
  return obj.tagName === Route.webComponentName.toLocaleUpperCase();
}

type HistoryPushState = typeof window.history.pushState;

interface OnUrlChange {
  (url: string): void;
}
interface PushStateProxy extends HistoryPushState {
  _isProxy: true;
}
