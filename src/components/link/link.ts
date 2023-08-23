import { builder } from "../../libs/elementBuilder/elementBuilder.ts";

export class Link extends HTMLElement {
  _shadowRoot: ShadowRoot;

  constructor() {
    super();

    const to = this.getAttribute("to");

    function handleClick(evt: MouseEvent) {
      // Don't let the browser navigate, we're going to push state ourselves.
      evt.preventDefault();
      window.history.pushState(null, "", to);
    }

    const a: HTMLAnchorElement = builder.create(
      "a",
      {
        listeners: { click: handleClick },
        properties: { href: to }
      },
      builder.create("slot")
    );

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
