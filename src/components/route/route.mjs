const PROPERTY_NAMES = ["path"];

/**
 * @implements {RouteMatch}
 * @implements {RouteActivation}
 */
class Route extends HTMLElement {
  constructor() {
    super();

    /** @type {boolean} */
    this._active = false;

    /** @type {HTMLElement} */
    this._element;

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get name() {
    return "rt4cw-route";
  }

  static get observedAttributes() {
    return PROPERTY_NAMES;
  }

  /**
   * @param {string} name
   * @param {string | null} current
   * @param {string | null} next
   */
  attributeChangedCallback(name, current, next) {
    // TODO?
  }

  /** @type {Match} */
  matchPath(path) {
    return path === this.getAttribute("path");
  }

  /** @type {Activate} */
  activate() {
    this._active = true;
    import(this.getAttribute("path")).then((/** @type {RouteChildModule} */ module) => {
      if (this._active) {
        this._element = module.init();
        this._shadowRoot.append(this._element);
      }
    });
  }

  /** @type {Deactivate} */
  deactivate() {
    this._active = false;
    this._element && this._shadowRoot.hasChildNodes() && this._shadowRoot.removeChild(this._element);
  }
}

if (!customElements.get(Route.name)) {
  customElements.define(Route.name, Route);
}

export { Route };

/**
 * @callback Match
 * @param {string} path
 * @returns {boolean}
 */

/**
 * @typedef RouteMatch
 * @property {Match} matchPath
 */

/**
 * @callback Activate
 * @returns {void}
 */

/**
 * @callback Deactivate
 * @returns {void}
 */

/**
 * @typedef RouteActivation
 * @property {Activate} activate;
 * @property {Deactivate} deactivate;
 */

/**
 * @callback RouteChildModuleInit
 * @returns {HTMLElement}
 */

/**
 * @typedef RouteChildModule
 * @property {RouteChildModuleInit} init;
 */