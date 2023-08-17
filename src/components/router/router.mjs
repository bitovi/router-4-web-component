// import { RouterForWebComponentBase } from "../r4w-base/r4w-base.mjs";

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

    /** @type {"connecting" | "idle"} */
    this._state = "connecting";

    setupNavigationHandling(url => {
      const children = this._shadowRoot.childNodes[0].assignedElements();

      for (const child of children) {
        child.match && child.match(url);
      }
    });
  }

  static get name() {
    return "rt4cw-router";
  }

  connectedCallback() {
    // console.log("Router.connectedCallback");

    /** @type {Route[]} */
    const children = this._shadowRoot.childNodes[0].assignedElements();

    let matched = false;
    let redirect;
    if (children.length) {
      for (const child of children) {
        if (child.tagName === Route.name.toLocaleUpperCase()) {
          child.data = { match: matchPath };
          matched = matched || matchPath(child.path);
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

    updateState(this, "idle");
  }

  disconnectedCallback() {
    // console.log("Router.disconnectedCallback");
  }
}

if (!customElements.get(Router.name)) {
  customElements.define(Router.name, Router);
}

export { Router };

/**
 * @param {string} path
 * @returns {boolean}
 */
function matchPath(path) {
  if (window.location.pathname === path) {
    return true;
  }

  return false;
}

/**
 * @param {OnUrlChange} onUrlChange
 */
function setupNavigationHandling(onUrlChange) {
  window.addEventListener("popstate", () => {
    console.log("setupNavigationHandling: popstate event.");
  });

  // Create a proxy for `pushState`.
  if (!window.history.pushState._isProxy) {
    const handler = {
      apply: (target, thisArg, [state, , url]) => {
        const result = target.apply(thisArg, [state, "", url]);

        // window.dispatchEvent(
        //   new CustomEvent("rt4wc-urlchange", { detail: url })
        // );
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
 *
 * @param {Router} router
 * @param {"connecting" | "idle"} state
 */
function updateState(router, state) {
  router._state = state;
}

/**
 * @callback OnUrlChange
 * @param {string} url
 * @returns {void}
 */
