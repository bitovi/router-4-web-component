export class Dropdown extends HTMLElement implements DropdownProps {
  private _connected = false;
  private _items: DropdownProps["items"] | undefined;

  constructor() {
    super();
  }

  static get webComponentName() {
    return "app-dropdown";
  }

  connectedCallback() {
    debugger;
    if (this._connected) {
      return;
    }

    this._connected = true;

    this.update();
  }

  /****************************************************************************
   * DropdownProps
   ****************************************************************************/
  get items(): DropdownProps["items"] {
    return this._items;
  }

  set items(listItems: DropdownProps["items"]) {
    debugger;
    this.setState("_items", listItems);
  }

  protected setState(property: string, value: unknown) {
    Object.defineProperty(this, property, { value });
  }

  protected update() {
    this.append(document.createElement("select"));
  }
}

if (!customElements.get(Dropdown.webComponentName)) {
  customElements.define(Dropdown.webComponentName, Dropdown);
}

interface DropdownProps {
  items: { text: string; value: string }[] | undefined;
}
