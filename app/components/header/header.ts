// import type { Link } from "https://esm.sh/@bitovi/router-4-web-component";
// import {
//   ComponentLifecycleMixin,
//   getPathnameData,
//   TemplateMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import type { Link } from "../../../dist/src/index.js";
import {
  ComponentLifecycleMixin,
  getPathnameData,
  TemplateMixin
} from "../../../dist/src/index.js";

export class Header extends TemplateMixin(
  ComponentLifecycleMixin(HTMLElement)
) {
  #currentPathname: string | undefined;

  constructor() {
    super();
    this.template_src = "app/components/header/header.html";
  }

  static get webComponentName(): string {
    return "app-header";
  }

  override _onTemplateReady(): void {
    this.#updateDOM();
  }

  onPathnameChange(pathname: string): void {
    this.setState(
      "#currentPathname",
      this.#currentPathname,
      pathname,
      next => (this.#currentPathname = next)
    );
  }

  override update(changedProperties: string[]): void {
    super.update && super.update(changedProperties);

    if (changedProperties.includes("#currentPathname")) {
      this.querySelectorAll("li").forEach(li => {
        const link = li.querySelector("r4w-link");

        if (this.#currentPathname && isLink(link)) {
          const { match } = getPathnameData(
            this.#currentPathname,
            link.getAttribute("to") ?? ""
          );

          if (match) {
            li.className = "active";
          } else {
            li.removeAttribute("class");
          }
        }
      });
    }
  }

  #updateDOM() {
    if (!this.template_html) {
      return;
    }

    const { match: matchHome } = getPathnameData(
      window.location.pathname,
      "/home"
    );
    const { match: matchRestaurants } = getPathnameData(
      window.location.pathname,
      "/restaurants"
    );
    const { match: matchOrderHistory } = getPathnameData(
      window.location.pathname,
      "/order-history"
    );

    this.innerHTML =
      this._replace({
        header_home_link: matchHome ? "active" : "",
        header_restaurants_link: matchRestaurants ? "active" : "",
        header_order_history_link: matchOrderHistory ? "active" : ""
      }) ?? "";
  }
}

if (!customElements.get(Header.webComponentName)) {
  customElements.define(Header.webComponentName, Header);
}

function isLink(obj: Element | null): obj is Link {
  return !!obj && obj.hasAttribute("to");
}
