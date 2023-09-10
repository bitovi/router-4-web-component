import type { RouteSelector, WebComponent } from "../../types.ts";

/**
 * Attributes:
 *   - to {string} Matches the `path` of a sibling route.
 */
export class Redirect
  extends HTMLElement
  implements RouteSelector, WebComponent
{
  #to: string | undefined;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ["to"];
  }

  static get webComponentName() {
    return "r4w-redirect";
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

  /******************************************************************
   * RouteSelector
   *****************************************************************/
  get to(): string | undefined {
    return this.#to;
  }
}

if (!customElements.get(Redirect.webComponentName)) {
  customElements.define(Redirect.webComponentName, Redirect);
}
