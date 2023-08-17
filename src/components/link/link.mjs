export class Link extends HTMLElement {
  constructor() {
    super();

    /**
     * @param {MouseEvent} evt
     */
    function handleClick(evt) {
      evt.preventDefault();
      window.history.pushState(null, "", to);
    }

    const to = this.getAttribute("to");

    /**
     * @type {HTMLAnchorElement}
     */
    const a = document.createElement("a");
    a.href = to;
    a.addEventListener("click", handleClick);
    a.appendChild(document.createElement("slot"));

    /** @type {ShadowRoot} */
    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(a);
  }

  static get name() {
    return "rt4cw-link";
  }
}

if (!customElements.get(Link.name)) {
  customElements.define(Link.name, Link);
}
