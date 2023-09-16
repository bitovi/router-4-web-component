// import type { Link } from "https://esm.sh/@bitovi/router-4-web-component";
// import {
//   BasecompMixin,
//   PathnameMixin
// } from "https://esm.sh/@bitovi/router-4-web-component";
import type { Link } from "../../../dist/src/index.js";
import { BasecompMixin, getPathnameData } from "../../../dist/src/index.js";

export class Header extends BasecompMixin(HTMLElement) {
  #currentPathname: string | undefined;

  constructor() {
    super();
  }

  static get webComponentName(): string {
    return "app-header";
  }

  override componentInitialConnect(): void {
    const { match: matchRoot } = getPathnameData(window.location.pathname, "/");
    const { match: matchRestaurants } = getPathnameData(
      window.location.pathname,
      "/restaurants"
    );
    const { match: matchOrderHistory } = getPathnameData(
      window.location.pathname,
      "/order-history"
    );

    const html = `<header>
  <nav>
      <h1>place-my-order.com</h1>
      <ul>
          <li ${
            matchRoot ? "class='active'" : ""
          }><r4w-link to="/">Home</r4w-link></li>
          <li ${
            matchRestaurants ? "class='active'" : ""
          }><r4w-link to="/restaurants">Restaurants</r4w-link></li>
          <li ${
            matchOrderHistory ? "class='active'" : ""
          }><r4w-link to="/order-history">Order History</r4w-link></li>
      </ul>
  </nav>
</header>`;

    this.innerHTML = html;
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
}

if (!customElements.get(Header.webComponentName)) {
  customElements.define(Header.webComponentName, Header);
}

function isLink(obj: Element | null): obj is Link {
  return !!obj && obj.hasAttribute("to");
}
