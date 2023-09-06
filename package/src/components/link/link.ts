import type { LinkEventDetails, WebComponent } from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { Router } from "../router/router.ts";

/**
 * Attributes:
 *   - to {string} Matches the path attribute of one route.
 */
export class Link extends HTMLElement implements WebComponent {
  private _to: string | undefined;

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
      this._to = newValue;
    }
  }

  connectedCallback() {
    function handleClick(this: Link, evt: MouseEvent) {
      // Don't let the browser navigate, we're going to push state ourselves.
      evt.preventDefault();

      this.dispatchEvent(
        new CustomEvent<LinkEventDetails>("r4w-link-event", {
          bubbles: true,
          composed: true,
          detail: { to: this._to ?? "" }
        })
      );
    }

    const a = create(
      "a",
      {
        listeners: { click: handleClick.bind(this) },
        properties: { href: this._to ?? "" }
      },
      create("slot")
    );

    this.shadowRoot?.appendChild(a);
  }
}

if (!customElements.get(Link.webComponentName)) {
  customElements.define(Link.webComponentName, Link);
}

function getUids(elem: HTMLElement): { routerUid: string } | void {
  if (!elem) {
    return;
  }

  if (elem.hasAttribute("routeruid")) {
    const routerUid = elem.getAttribute("routeruid");
    if (!routerUid) {
      return;
    }

    return { routerUid };
  }

  if (elem instanceof Router) {
    return { routerUid: (elem as Router).uid };
  }
}
