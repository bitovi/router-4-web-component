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

#### class `Params`

This class is used as a base for web components that want to get params
information from a route's path. Must be a descendant of an `<r4w-route>`
element.

Can be used in a [mixin
definition](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
of a web component.

Create a web component.

```ts
import { Params } from "https://esm.sh/@bitovi/router-4-web-component";

export class MyWebComponent extends Params {
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

#### class `PathnameChanged`

This class is used as a base for web components that want to be informed when
the browser's path changes. Must be a descendant of an `<r4w-router>` element.

Can be used in a [mixin
definition](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
of a web component.

Create a web component.

```ts
import { PathnameChanged } from "https://esm.sh/@bitovi/router-4-web-component";

export class MyWebComponent extends PathnameChanged {
  override onPathnameChange(pathname: string): void {
    console.log("onPathnameChange: pathname=", pathname);
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

When this code is executed the text "onPathnameChange: pathname= /items/42" will
be logged.

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

Any element.

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

[![](https://mermaid.ink/img/pako:eNqFVEtT2zAQ_is7uhQySSCJE4OGyYkeemDaacul40NUa4M12FIqySmU4b-zsmznxZTb2vt5v4dWfmG5kcg4c_inRp3jrRIPVlSZBtgI61WuNkJ7KPUjCAc3Nvk7KpV-XB4DrKk92h4TH99HHYJOMHntvKkaUCxHuak2RqP2J1iHdhtZY5XpgNCGSExokGwO99SDvFT5o4OgPUCCn9FyGQFSuY3weQGrzt4It0S3iuOiF0LHggNuRVkL4jjF75N38C9raNqfHH3QvLtXcgXSoLv5beFiSZ9A1QgQ8L0BBGgdQNQqlH6IuLWx4AvhWxB4Q0PG8PlJ-XGUWhqzCWT2GfJClfI4585M470pOSXnvwlfnJ0HAGq5Z3oHIxtG3wWNAfcxVSQTpafj8kXjFXqbsfmeFoki92pL2UY5PWofZLGifOMTBdWwx4CwxIqCdrC2tEG-QLj9ehfnYOkwahkMgprB4CMt-0o6VDDUeykEqaiMrEvs-r3aMCeuJAdF22v92Sqwr8530HZ5RwfWHG266-f1x9GQt4LaG9K9bu9LmBLLEONaaTzL2PEFyljPv9vT7qvT60apXiyVA6V3Ye5HEc0Woj0E6PI_iWMvVSn_e3K00wfn1mZwEEZfHN01Dj9pG-MeolQWc9-u4m6vWrdsyCq0lVCS_n0vAZIx4q0wY5xKClDUJcWV6VeCitqbH886Z9zbGoes3kga1f4qGV8LWq4hoz8S4y_sifHpZDybJpNpOrlOp4v5YjofsmfGR7PZfJym6SxNpot0nl5NXofsnyE1fDJepMnlVTK_vEySq9nsetLM-9U0A-nrG4VT48M?type=png)](https://mermaid.live/edit#pako:eNqFVEtT2zAQ_is7uhQySSCJE4OGyYkeemDaacul40NUa4M12FIqySmU4b-zsmznxZTb2vt5v4dWfmG5kcg4c_inRp3jrRIPVlSZBtgI61WuNkJ7KPUjCAc3Nvk7KpV-XB4DrKk92h4TH99HHYJOMHntvKkaUCxHuak2RqP2J1iHdhtZY5XpgNCGSExokGwO99SDvFT5o4OgPUCCn9FyGQFSuY3weQGrzt4It0S3iuOiF0LHggNuRVkL4jjF75N38C9raNqfHH3QvLtXcgXSoLv5beFiSZ9A1QgQ8L0BBGgdQNQqlH6IuLWx4AvhWxB4Q0PG8PlJ-XGUWhqzCWT2GfJClfI4585M470pOSXnvwlfnJ0HAGq5Z3oHIxtG3wWNAfcxVSQTpafj8kXjFXqbsfmeFoki92pL2UY5PWofZLGifOMTBdWwx4CwxIqCdrC2tEG-QLj9ehfnYOkwahkMgprB4CMt-0o6VDDUeykEqaiMrEvs-r3aMCeuJAdF22v92Sqwr8530HZ5RwfWHG266-f1x9GQt4LaG9K9bu9LmBLLEONaaTzL2PEFyljPv9vT7qvT60apXiyVA6V3Ye5HEc0Woj0E6PI_iWMvVSn_e3K00wfn1mZwEEZfHN01Dj9pG-MeolQWc9-u4m6vWrdsyCq0lVCS_n0vAZIx4q0wY5xKClDUJcWV6VeCitqbH886Z9zbGoes3kga1f4qGV8LWq4hoz8S4y_sifHpZDybJpNpOrlOp4v5YjofsmfGR7PZfJym6SxNpot0nl5NXofsnyE1fDJepMnlVTK_vEySq9nsetLM-9U0A-nrG4VT48M)
