class Route extends HTMLElement {
  constructor() {
    super();
  }

  static get name() {
    return "r4w-route";
  }

  static get observedAttributes() {
    return ["path"];
  }

  connectedCallback() {
    console.log(`Route.connectedCallback: path='${this.getAttribute("path")}'`);
  }

  disconnectedCallback() {
    console.log("Route.disconnectedCallback");
  }
}

if (!customElements.get(Route.name)) {
  customElements.define(Route.name, Route);
}

export { Route };
