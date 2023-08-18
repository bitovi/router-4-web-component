/**
 * @implements {RouteMatch}
 * @implements {RouteActivation}
 */
class Route extends HTMLElement {
  /**
   * @type {RouteMatch}
   */
  constructor() {
    super();

    /** @type {boolean} */
    this._active = false;

    /** @type {HTMLElement | undefined} */
    this._element;

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get name() {
    return "r4w-route";
  }

  /** @type {Match} */
  matchPath(path) {
    return path === this.getAttribute("path");
  }

  activate() {
    this._active = true;

    Promise.resolve(
      this._element ??
        import(createImportPath(this.getAttribute("path"))).then(
          (/**  @type {RouteChildModule} */ module) => module.init()
        )
    ).then((/** @type {HTMLElement | undefined} */ element) => {
      this._element = element || undefined;

      if (!this._active || this._shadowRoot.hasChildNodes() || !this._element) {
        return;
      }

      this._shadowRoot.append(this._element);
    });
  }

  deactivate() {
    this._active = false;

    this._element &&
      this._shadowRoot.hasChildNodes() &&
      this._shadowRoot.removeChild(this._element);
  }
}

if (!customElements.get(Route.name)) {
  customElements.define(Route.name, Route);
}

export { Route };

/**
 * @param {string} path
 * @returns {string}
 */
function createImportPath(path) {
  return `${path}.mjs`;
}
