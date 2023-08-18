class Foo extends HTMLParagraphElement {
  constructor() {
    super();
  }

  static get name() {
    return "app-foo";
  }
}

if (!customElements.get(Foo.name)) {
  customElements.define(Foo.name, Foo);
}

const p = document.createElement("p");
p.is = Foo.name;
p.textContent = "foo para";

export default p;