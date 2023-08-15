class Link extends HTMLElement {
  constructor() {
    super();
  }

  static get name() {
    return "rt4cw-link";
  }

  connectedCallback() {
    /** @type {HTMLLinkElement} */
    const a = document.createElement("a");
    for (const key in Object.keys(a)) {
      a[key] = this.getAttribute(key);
    }

    a.textContent = this.textContent;

    this.append(a);
  }
}

if (!customElements.get(Link.name)) {
  customElements.define(Link.name, Link);
}

export { Link };
