const PROPERTY_NAMES = ["path"];

/**
 * @class Route
 */
class Route extends HTMLElement {
  constructor() {
    super();

    /** @type {RouteData} */
    this._data;

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get name() {
    return "rt4cw-route";
  }

  static get observedAttributes() {
    return PROPERTY_NAMES;
  }

  /** @returns {RouteData} */
  get data() {
    return { ...this._data };
  }

  set data(/** @type {RouteData} */ next) {
    // console.log("Route.data: next=", next);
    this._data = next;
  }

  /**
   * @param {string} name
   * @param {string | null} current
   * @param {string | null} next
   */
  attributeChangedCallback(name, current, next) {
    if (name === "path") {
      handlePathChanged(this, current, next);
    }
  }

  connectedCallback() {
    window.addEventListener("rt4wc-urlchange", evt => {
      const path = this.getAttribute("path");

      if (this._data.match(path)) {
        const para = document.createElement("p");
        para.textContent = `path = '${path}'`;
        this._shadowRoot.append(para);
      } else {
        this._shadowRoot.innerHTML = "";
      }
    });
  }

  disconnectedCallback() {
    // console.log("Route.disconnectedCallback");
  }
}

if (!customElements.get(Route.name)) {
  customElements.define(Route.name, Route);
}

export { Route };

/**
 * @param {Route} route
 * @param {string} current
 * @param {string} next
 */
function handlePathChanged(route, current, next) {
  // console.log(`handlePathChanged: current='${current}', next='${next}'`);
}

/**
 * @callback Match
 * @param {string} path
 * @returns {boolean}
 */

/**
 * @typedef RouteData
 * @property {Match} match
 */
