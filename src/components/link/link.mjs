class Link extends HTMLAnchorElement {
  constructor() {
    super();

    this.addEventListener("click", handleClick);
  }

  static get name() {
    return "rt4cw-link";
  }

  connectedCallback() {
    // console.log("Link.connectedCallback");
  }

  disconnectedCallback() {
    // console.log("Link.disconnectedCallback");
  }
}

if (!customElements.get(Link.name)) {
  customElements.define(Link.name, Link, { extends: "a" });
}

export { Link };

/**
 * 
 * @param {Event} evt 
 */
function handleClick(evt) {
  console.log("Link handleClick: evt=", evt);
  evt.preventDefault();
}