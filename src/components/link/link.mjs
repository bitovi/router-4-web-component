export class Link extends HTMLElement {
  constructor() {
    super();

    const to = this.getAttribute("to");

    /**
     *
     * @param {Event} evt
     */
    function handleClick(evt) {
      console.log("Link handleClick: evt=", evt);
      evt.preventDefault();

      window.history.pushState(null, "", to);
    }

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

  connectedCallback() {
    // console.log("Link2.connectedCallback");
  }

  disconnectedCallback() {
    // console.log("Link.disconnectedCallback");
  }
}

if (!customElements.get(Link.name)) {
  customElements.define(Link.name, Link);
}
