class Foo extends HTMLParagraphElement {
  constructor() {
    super()
  }

  static get name() {
    return "app-foo";
  }
}

if (!customElements.get(Foo.name)) {
  customElements.define(Foo.name, Foo);
}

/**
 * @returns {HTMLElement}
 */
export function init() {
  const p = document.createElement("p");
  p.is = Foo.name;
  p.textContent = "foo para"

  return p;
};
