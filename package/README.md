# @bitovi/router-4-web-component

A router for web components.

## Install

Use Skypack and import this module into a source file where you need to use the router.

```ts
import from "https://cdn.skypack.dev/@bitovi/router-4-web-component";
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

#### class `Params`

This abstract class is used as a base for web components that want to get params
information from a route's path. An instance of this class can only be an
element that is the immediate child of `<r4w-route>`.

Create a web component.

```ts
import { Params } from "https://cdn.skypack.dev/@bitovi/router-4-web-component";

export class MyWebComponent extends Params {
  protected override onParamsChange(params: Record<string, string>): void {
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
  <r4w-link path="/items/42">The meaning of...</r4w-link>
  <r4w-route path="/items/:item">
    <my-web-component />
  </r4w-route>
</r4w-router>
```

When this code is executed the text "onParamsChange: params= { item: 42 }" will be logged.

---

#### element `<r4w-link>`

Must be a **descendant** of an `<rw4-router>` element. When the element is
clicked browser history is updated and a matching route that is a child of the
same `<rw4-router>` ancestor element is activated.

##### Attributes

- `to` - The path that will be pushed to browser history. Must match the `path`
  attribute of an `<r4w-route>` element.

##### Descendants

Same descendants as an `<a>` tag.

---

#### element `<r4w-redirect>`

Must be an immediate child of `<r4w-router>`. Will be used to update browser
history if none of the `<r4w-route>` elements match the current URL.

##### Attributes

- `to` - Must match the path of a sibling `<r4w-route>` element.

##### Descendants

None.

---

#### element `<r4w-route>`

Must be an immediate child of `<r4w-router>`. Child elements will be added to the DOM when
the route becomes active, and will be removed when it is deactivated. Usually
activated when the user clicks an `<r4w-link>` element. If the route has a `src`
attribute the source file will be dynamically imported (and cached) then the
children added to the DOM; otherwise children are immediately attached to the
DOM.

##### Attributes

- `path` - The path pushed to browser history. Must match the `to` attribute of
  an `<r4w-link>` that shares the same ancestor `<r4w-router>`.
- `src` - A path to a source code file. Will be imported dynamically (and
  cached) the first time the route is activated.

##### Descendants

Any element. Web components that extend [Params](#params) must be direct
children of this element.

---

#### element `<r4w-router>`

Activates child `<r4w-route>` elements when a descendant `<r4w-link>` element
is clicked or an `<rw4-redirect>` takes effect.

##### Attributes

None

##### Descendants

Any element. The `<r4w-route>` and `<r4w-redirect>` elements must be a direct
children of this element.

---

### Routing Sequence

[![](https://mermaid.ink/img/pako:eNqFlM9v2jAUx_-VJ19GEdBCIxhWxak77FBt2tbLlEM859FYJDazHVaG-N_3HCeBQaVe0CP-2N_v-2EfmDQ5Ms4c_q5RS3xU4sWKKtUAW2G9kmortIdSb0A4eLDJn3Gp9GZ1CVhTe7Q9E_--Tf0PXTGydt5UDRTDsTTV1mjU_op1aHdRNUapDoQ2JGLCAtnm8ExrIEslNw6C94CEfMarVQRy5bbCywKyLr0x7kgui8fFXIiOAQfcibIWpHHNn4t3-Oc1NMsfHG1ovj2rPIPcoHv4ZeF2RVugagwI-NYAAa0DREuF0i-RWxsLvhC-hcAbOmQCn16Vn0SrpTHbIGb3IAtV5pd17pJpcm9CTpXzX4UvBjcBQJ2fJX3CKA2jn4LHwL0vFcVE6aldvmhyhT7NuPiWlxyF9GpHtY12euocinJkG7LQuVLsuabxyOIGLB1G0eEwyA6H74meS3ZUcN6bLsQOoTJ5XWK33tsK58TZ46BoTK0fZEE9uzmh7ZSOzzQtOhpp15_X170Rbw21V6H73F6McEoMQ73WSuMgZZc3JWW9_mkgu13X94rm63alHChNA4bw-OWpLWZnqw8uxpvDDxqA2HrMlUXp2-6fWtnqshGr0FZC5fTcHAKSMhKrMGWcQkpF1CUZT_WRUFF7832vJePe1jhi9Tano9rXifG1oDaPGD0CjB_YK-Oz5G4yn8_ul8vZcko_sxHbM55MpouP9_PFfJoskvndMjmO2F9DXvi02fyziYPC8R9HT7LA?type=png)](https://mermaid.live/edit#pako:eNqFlM9v2jAUx_-VJ19GEdBCIxhWxak77FBt2tbLlEM859FYJDazHVaG-N_3HCeBQaVe0CP-2N_v-2EfmDQ5Ms4c_q5RS3xU4sWKKtUAW2G9kmortIdSb0A4eLDJn3Gp9GZ1CVhTe7Q9E_--Tf0PXTGydt5UDRTDsTTV1mjU_op1aHdRNUapDoQ2JGLCAtnm8ExrIEslNw6C94CEfMarVQRy5bbCywKyLr0x7kgui8fFXIiOAQfcibIWpHHNn4t3-Oc1NMsfHG1ovj2rPIPcoHv4ZeF2RVugagwI-NYAAa0DREuF0i-RWxsLvhC-hcAbOmQCn16Vn0SrpTHbIGb3IAtV5pd17pJpcm9CTpXzX4UvBjcBQJ2fJX3CKA2jn4LHwL0vFcVE6aldvmhyhT7NuPiWlxyF9GpHtY12euocinJkG7LQuVLsuabxyOIGLB1G0eEwyA6H74meS3ZUcN6bLsQOoTJ5XWK33tsK58TZ46BoTK0fZEE9uzmh7ZSOzzQtOhpp15_X170Rbw21V6H73F6McEoMQ73WSuMgZZc3JWW9_mkgu13X94rm63alHChNA4bw-OWpLWZnqw8uxpvDDxqA2HrMlUXp2-6fWtnqshGr0FZC5fTcHAKSMhKrMGWcQkpF1CUZT_WRUFF7832vJePe1jhi9Tano9rXifG1oDaPGD0CjB_YK-Oz5G4yn8_ul8vZcko_sxHbM55MpouP9_PFfJoskvndMjmO2F9DXvi02fyziYPC8R9HT7LA)
