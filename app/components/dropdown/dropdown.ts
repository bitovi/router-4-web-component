import { Basecomp } from "../basecomp/basecomp.ts";

let uid = 0;

export class Dropdown extends Basecomp(HTMLElement) implements DropdownProps {
  #defaultItem: DropdownItem | undefined;
  #disabled = false;
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
  get defaultItem(): DropdownItem | undefined {
    return this.#defaultItem;
  }

  set defaultItem(item: DropdownItem) {
    this.setState(
      "#defaultItem",
      this.#defaultItem,
      item,
      next => (this.#defaultItem = next)
    );
  }

  get disabled(): boolean {
    return this.#disabled;
  }

  set disabled(disabled: boolean) {
    this.setState(
      "#disabled",
      this.#disabled,
      disabled,
      next => (this.#disabled = next)
    );
  }

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

  override componentInitialConnect(): void {
    const select = document.createElement("select");
    select.append(...this.#getItemsList().map(this.createOption.bind(this)));
    select.disabled = this.disabled;

    this.append(select);
  }

  override update(changedProperties: string[]) {
    if (!this.firstElementChild) {
      return;
    }

    if (
      changedProperties.includes("#items") ||
      changedProperties.includes("#defaultItem")
    ) {
      const items = this.#getItemsList();
      let options: string | undefined;
      if (items.length) {
        options = items.map(item => this.createOption(item).outerHTML).join("");
      } else {
        options = "";
      }

      this.firstElementChild.innerHTML = `<select>${options}</select>`;
    }

    if (changedProperties.includes("#disabled")) {
      const { firstElementChild } = this;
      if (isSelectElement(firstElementChild)) {
        firstElementChild.disabled = this.#disabled;
      }
    }
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

  #getItemsList(): DropdownItem[] {
    const items: DropdownItem[] = [];
    if (this.#defaultItem) {
      items.push(this.#defaultItem);
    }

    if (this.#items?.length) {
      items.push(...this.#items);
    }

    return items;
  }
}

if (!customElements.get(Dropdown.webComponentName)) {
  customElements.define(Dropdown.webComponentName, Dropdown);
}

function isSelectElement(obj: any): obj is HTMLSelectElement {
  return obj && "disabled" in obj && "value" in obj;
}

interface DropdownProps {
  defaultItem?: DropdownItem | undefined;
  disabled: HTMLSelectElement["disabled"];
  items: DropdownItem[] | undefined;
}

interface DropdownItem {
  key: number | string;
  selected?: boolean;
  text: string;
  value: string;
}
