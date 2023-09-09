import { Basecomp } from "../basecomp/basecomp.ts";

let uid = 0;

export class Dropdown extends Basecomp(HTMLElement) implements DropdownProps {
  #items: DropdownProps["items"] | undefined;
  #uid: string;

  constructor() {
    super();

    uid = uid + 1;
    this.#uid = `${Dropdown.webComponentName}-${uid}`;
  }

  static get webComponentName() {
    return "app-dropdown";
  }

  /****************************************************************************
   * DropdownProps
   ****************************************************************************/
  get items(): DropdownProps["items"] {
    return this.#items;
  }

  set items(nextItems: DropdownProps["items"]) {
    this.setState(
      "#items",
      this.#items,
      nextItems,
      next => (this.#items = next)
    );
  }

  override componentConnected(): void {
    const select = document.createElement("select");

    if (this.items) {
      select.append(...this.items.map(this.createOption));
    }

    this.append(select);
  }

  override update() {
    if (!this.firstElementChild) {
      return;
    }

    if (!this.#items?.length) {
      this.innerHTML = "";
      return;
    }

    const options = this.#items
      .map(item => this.createOption(item).outerHTML)
      .join("");

    this.firstElementChild.innerHTML = `<select>${options}</select>`;
  }

  protected createOption({
    key,
    text,
    value,
    selected
  }: DropdownItem): HTMLOptionElement {
    const opt = document.createElement("option");

    opt.id = this.#createId(key);
    opt.textContent = text;
    opt.value = value;

    if (selected) {
      opt.selected = true;
    }

    return opt;
  }

  #createId(key: number | string): string {
    return `${this.#uid}-${key}`;
  }
}

if (!customElements.get(Dropdown.webComponentName)) {
  customElements.define(Dropdown.webComponentName, Dropdown);
}

interface DropdownProps {
  items: DropdownItem[] | undefined;
}

interface DropdownItem {
  key: number | string;
  selected?: boolean;
  text: string;
  value: string;
}
