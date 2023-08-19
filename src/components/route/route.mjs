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

    /** @type {boolean} */
    this._module = false;

    this._slot = document.createElement("slot");

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(this._slot);
  }

  static get name() {
    return "r4w-route";
  }

  /** @type {Match} */
  matchPath(path) {
    return path === this.getAttribute("path");
  }

  activate() {
    if (this._active) {
      return;
    }

    this._active = true;

    Promise.resolve(
      this._module
        ? undefined
        : import(createImportPath(this.getAttribute("path"))).then(() => {
            this._module = true;
          })
    ).then(() => {
      this._active && this._shadowRoot.append(this._slot);
    });
  }

  deactivate() {
    if (!this._active) {
      return;
    }

    this._active = false;

    this._slot &&
      this._shadowRoot.hasChildNodes() &&
      this._shadowRoot.removeChild(this._slot);
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
