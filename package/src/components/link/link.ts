import type { LinkEventDetails, WebComponent } from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";

/**
 * Attributes:
 *   - to {string} Matches the path attribute of one route.
 */
export class Link extends HTMLElement implements WebComponent {
  #init = false;
  #to: string | undefined;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes(): string[] {
    return ["to"];
  }

  static get webComponentName() {
    return "r4w-link";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "to") {
      this.#to = newValue;
    }
  }

  connectedCallback() {
    if (!this.#init) {
      this.#init = true;

      const a = create(
        "a",
        {
          listeners: { click: this.#handleClick.bind(this) },
          properties: { href: this.#to ?? "" }
        },
        create("slot")
      );

      this.shadowRoot?.appendChild(a);
    }
  }

  #handleClick(evt: MouseEvent) {
    // Don't let the browser navigate, we're going to push state ourselves.
    evt.preventDefault();

    this.dispatchEvent(
      new CustomEvent<LinkEventDetails>("r4w-link-event", {
        bubbles: true,
        composed: true,
        detail: { to: this.#to ?? "" }
      })
    );
  }
}

if (!customElements.get(Link.webComponentName)) {
  customElements.define(Link.webComponentName, Link);
}
