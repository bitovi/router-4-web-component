import { BasecompPathnameChanged } from "../../components/basecomp/basecomp.ts";
import type { Link } from "../../../dist/src/index.js";
import { Pathname } from "../../../dist/src/index.js";

export class Header extends BasecompPathnameChanged {
  #currentPathname: string | undefined;

  constructor() {
    super();
  }

  static get webComponentName() {
    return "app-header";
  }

  override componentConnected(): void {
    const { match: matchRoot } = Pathname.getPathnameData(
      window.location.pathname,
      "/"
    );
    const { match: matchRestaurants } = Pathname.getPathnameData(
      window.location.pathname,
      "/restaurants"
    );
    const { match: matchOrderHistory } = Pathname.getPathnameData(
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

  override onPathnameChange(pathname: string): void {
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
          const { match } = Pathname.getPathnameData(
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
