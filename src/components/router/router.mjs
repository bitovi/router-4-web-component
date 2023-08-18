import { Redirect } from "../redirect/redirect.mjs";
import { Route } from "../route/route.mjs";

/**
 * The base element for routing. Accepts one child element.
 */
class Router extends HTMLElement {
  constructor() {
    super();

    const slot = document.createElement("slot");

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(slot);

    /**
     * @param {string} url Just the path portion of a URL.
     */
    function handleUrlChange(url) {
      /** @type {Route[]} */
      const children = this._shadowRoot.childNodes[0].assignedElements();
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

  static get name() {
    return "rt4cw-router";
  }

  connectedCallback() {
    // Determine if there is currently a path available and if so activate it,
    // otherwise if there is a redirect navigate to it.

    /** @type {(Route | Redirect)[]} */
    const children = this._shadowRoot.childNodes[0].assignedElements();

    let matched = false;
    /** @type {Redirect | undefined} */
    let redirect;
    if (children?.length) {
      for (const child of children) {
        if (isRoute(child)) {
          matched = matched || child.matchPath(child.path);
        } else if (
          !redirect &&
          child.tagName === Redirect.name.toLocaleUpperCase()
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

if (!customElements.get(Router.name)) {
  customElements.define(Router.name, Router);
}

export { Router };

/**
 * @param {OnUrlChange} onUrlChange
 */
function setupNavigationHandling(onUrlChange) {
  window.addEventListener("popstate", (/** @type {PopStateEvent} */ evt) => {
    onUrlChange(window.location.pathname);
  });

  // Create a proxy for `pushState`.
  if (!window.history.pushState._isProxy) {
    const handler = {
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

/**
 * @param {HTMLElement} obj
 * @@returns {obj is Route}
 */
function isRoute(obj) {
  return obj.tagName === Route.name.toLocaleUpperCase();
}

/**
 * @callback OnUrlChange
 * @param {string} url
 * @returns {void}
 */
