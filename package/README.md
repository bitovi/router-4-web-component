# @bitovi/router-4-web-component

A router for web components.

## Install

Use "esm.sh" and import this module into a source file where you need to use the
router.

```ts
import from "https://esm.sh/@bitovi/router-4-web-component";
```

Then you can use the router in your HTML.

```html
<r4w-router>
  <r4w-route path="/foo" src="/foo.js">
    <my-web-component />
  </r4w-route>
</r4w-router>
```

### API

#### mixin `ParamsListenerMixin`

This mixin is used as a base for web components that want to get params
information from a route's path. Must be a descendant of an `<r4w-route>`
element.

Can be used in a [mixin
definition](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
of a web component.

Create a web component.

```ts
import { ParamsListenerMixin } from "https://esm.sh/@bitovi/router-4-web-component";

export class MyWebComponent extends ParamsListenerMixin(HTMLElement) {
  override onParamsChange(params: Record<string, string>): void {
    // The params information in the `params` object depends on the tokens
    // included in the value of an `<r4w-route>` `path` attrbute.
    console.log("onParamsChange: params=", params);
  }
}

if (!customElements.get("my-web-component")) {
  customElements.define("my-web-component", MyWebComponent);
}
```

Use the web component.

```html
<r4w-router>
  <r4w-link to="/items/42">The meaning of...</r4w-link>
  <r4w-route path="/items/:item">
    <my-web-component />
  </r4w-route>
</r4w-router>
```

When this code is executed the text "onParamsChange: params= { item: 42 }" will
be logged.

---

#### element `<r4w-link>`

Must be a **descendant** of the `<rw4-router>` element. When the link is clicked
browser history is updated, a matching route that is a child of the same
`<rw4-router>` ancestor element will be activated.

##### Attributes

- `to` - The path that will be pushed to browser history.

##### Descendants

Same descendants as an `<a>` tag.

---

#### element `<r4w-redirect />`

Must be an **immediate** child of `<r4w-switch>`. Will be used to update browser
history if none of the immediate child `<r4w-route>` elements match the current
URL.

##### Attributes

- `to` - The path that will be pushed to browser history.

##### Descendants

None

---

#### element `<r4w-route>`

Child elements will be added to the DOM when its `path` matches the browser
location and the route becomes active; child elements will be removed when it is
deactivated. If the route has a `src` attribute the source file will be
dynamically imported (and cached) when the route is activated then the children
will be added to the DOM; otherwise children are immediately attached to the
DOM.

##### Attributes

- `path` - The path pushed to browser history.
- `src` - A path to a source code file. Will be imported dynamically (and
  cached) the first time the route is activated.

##### Descendants

Any element

---

#### element `<r4w-router>`

All r4w elements must be nested under a single r4w-router. This is the most
basic component and should probably be placed close to the `<body` element of
the document.

##### Attributes

None

##### Descendants

Any element

---

#### element `<r4w-switch>`

Activates a single child `<r4w-route>` element (that is an immediate child of
the switch) when a `path` matches the browser location or an `<rw4-redirect>`
takes effect.

##### Attributes

None

##### Descendants

Any element. The `<r4w-redirect>` element must be a direct child of this
element.

---
