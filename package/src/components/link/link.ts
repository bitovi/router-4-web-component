import type { LinkEventDetails } from "../../types.ts";
import { builder } from "../../libs/elementBuilder/elementBuilder.ts";
import { AttributesBase } from "../attributes-base/attributes-base.ts";
import { Router } from "../router/router.ts";

export class Link extends AttributesBase {
  private _shadowRoot: ShadowRoot;
  private _to: string | undefined;

  constructor() {
    super();

    function handleClick(this: Link, evt: MouseEvent) {
      // Don't let the browser navigate, we're going to push state ourselves.
      evt.preventDefault();

      let parent = this.parentElement;
      while (parent && !(parent instanceof Router)) {
        parent = parent.parentElement;
      }

      if (!parent) {
        throw Error(
          "Could not found a Router ancestor. <r4w-link> must be a child of a <r4w-router> element."
        );
      }

      window.dispatchEvent(
        new CustomEvent<LinkEventDetails>("r4w-link-event", {
          detail: { routerUid: (parent as Router).uid, to: this._to ?? "" }
        })
      );
    }

    const a: HTMLAnchorElement = builder.create(
      "a",
      {
        listeners: { click: handleClick.bind(this) },
        properties: { href: this._to ?? "" }
      },
      builder.create("slot")
    );

    this._shadowRoot = this.attachShadow({ mode: "closed" });
    this._shadowRoot.append(a);
  }

  static get observedAttributes(): string[] {
    return ["to"];
  }

  static get webComponentName() {
    return "r4w-link";
  }
}

if (!customElements.get(Link.webComponentName)) {
  customElements.define(Link.webComponentName, Link);
}
