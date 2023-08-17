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
    /** @type {Route[]} */
    const children = this._shadowRoot.childNodes[0].assignedElements();

    let matched = false;
    let redirect;
    if (children.length) {
      for (const child of children) {
        if (child.tagName === Route.name.toLocaleUpperCase()) {
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
 * @callback OnUrlChange
 * @param {string} url
 * @returns {void}
 */
