import type { LinkEventDetails, WebComponent } from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { getAttributeNames } from "../../libs/dom/dom.ts";

/**
 * Attributes:
 *   - to {string} Matches the path attribute of one route.
 */
export class Link extends HTMLElement implements WebComponent {
  #cachedAttributes: Record<string, string> | undefined;
  #init = false;
  #to: string | undefined;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes(): string[] {
    const attrs = getAttributeNames("a", "href");
    return [...attrs, "to"];
  }

  static get webComponentName(): string {
    return "r4w-link";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "to") {
      this.#to = newValue;
    } else {
      const a = this.shadowRoot?.querySelector("a");
      if (a) {
        a.setAttribute(name, newValue);
      } else {
        this.#cachedAttributes = this.#cachedAttributes || {};
        this.#cachedAttributes[name] = newValue;
      }
    }
  }

  connectedCallback(): void {
    if (!this.#init) {
      this.#init = true;

      const a = create(
        "a",
        {
          attributes: this.#cachedAttributes || {},
          listeners: { click: this.#handleClick.bind(this) },
          properties: {
            href: this.#to ?? ""
          }
        },
        create("slot")
      );

      this.#cachedAttributes = undefined;

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
