export class Link extends HTMLElement {
  _shadowRoot: ShadowRoot;

  constructor() {
    super();

    /**
     * @param {MouseEvent} evt
     */
    function handleClick(evt: MouseEvent) {
      evt.preventDefault();
      window.history.pushState(null, "", to);
    }

    const to = this.getAttribute("to");

    /**
     * @type {HTMLAnchorElement}
     */
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = to;
    a.addEventListener("click", handleClick);
    a.appendChild(document.createElement("slot"));

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(a);
  }

  static get webComponentName() {
    return "r4w-link";
  }
}

if (!customElements.get(Link.webComponentName)) {
  customElements.define(Link.webComponentName, Link);
}
