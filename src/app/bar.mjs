class Bar extends HTMLParagraphElement {
  constructor() {
    super()
  }

  static get name() {
    return "app-bar";
  }
}

if (!customElements.get(Bar.name)) {
  customElements.define(Bar.name, Bar);
}

/**
 * @returns {HTMLElement}
 */
export function init() {
  const p = document.createElement("p");
  p.is = Bar.name;
  p.textContent = "bar para"

  return p;
};
