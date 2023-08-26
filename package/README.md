# router-4-web-component

A router for web components.

## Install

Use Skypack and import this module into a source file where you need to use the router.

```ts
import from "https://cdn.skypack.dev/router-4-web-component";
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

#### `<r4w-link>`

Must be a **descendant** of an `<rw4-router>` element. When the element is
clicked browser history is updated and a matching route that is a child of the
same `<rw4-router>` ancestor element is activated.

##### Attributes

- `to` - The path that will be pushed to browser history. Must match the `path`
  attribute of an `<r4w-route>` element.

##### Descendants

Same descendants as an `<a>` tag.

---

#### `<r4w-router>`

Activates child `<r4w-route>` elements when a descendant `<r4w-link>` element
is clicked or an `<rw4-redirect>` takes effect.

##### Attributes

None

##### Descendants

Any element. The `<r4w-route>` and `<r4w-redirect>` elements must be direct
children of this element.

---

#### `<r4w-route>`

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

#### `<r4w-redirect>`

Must be an immediate child of `<r4w-router>`. Will be used to update browser
history if none of the `<r4w-route>` elements match the current URL.

##### Attributes

- `to` - Must match the path of a sibling `<r4w-route>` element.

##### Descendants

None.

---

### Routing Sequence

[![](https://mermaid.ink/img/pako:eNqFlE1v2kAQhv_KaC8lCBMwJhgr4pQeeqhatcol8sFbe4lX2Lvu7pqGIv57Z73-CkTqbfA8M-874zFnksqMkYho9rtmImVPnL4qWsYCoKLK8JRXVBgoxAGohkcV_PEKLg67a0DJ2jDVM-7nx9R76IZJa21k2UAu9FJZVlIwYW5YzdTRqbooFpYQEkWkTaDtCJ4xB2nB04MG690idh5vt3NAxnVFTZpD0o3nsSPKJa6dmwVpF0TAjrSoKWrc8mPxDv-yhyb9SWNB8-yZZwlkkunHXwrud1gCZWOAwo8GsGhtIUzlXLw6bi8VmJyaFgIjsckcPr9xM3dWCykrK6ZOkOa8yK733A3TzN6EkVP-Tk0-uXNNAGhhcM0mbzxCb88lP-qRMZoafsSd2CYjagwpVuJeWmN7he_46dtXR7NCM6c4nVrN6fR_iqjXyXWQdd0bzmkn1aV7R7aLO5cIOF6WMpPEaid3A9oelvfOvsYr1KyDmMgGbTzKobjbRXvKQ6I9bdvUhXZzey7YJCbXtx6TkZ3hqLq6228Db-R-xzVwgUfCht2iH3G7hNH7l7X9kgpcGpaOylhX1k_aPhnedj8hmZGSqZLyDP9LzhaKCbooWUwiDHFKWhc4UywuiNLayJ8nkZLIqJrNSF1l2Kz96yHRnuI5zAh-4SQ6kzcSecvNajFfLRaLIAz9cOmvZ-RkH29Df754WPqbrb99CDfry4z8lRJb-PMwDNbIB6tVEGwxaPq9NMmm_-Uf7xOjlQ?type=png)](https://mermaid.live/edit#pako:eNqFlE1v2kAQhv_KaC8lCBMwJhgr4pQeeqhatcol8sFbe4lX2Lvu7pqGIv57Z73-CkTqbfA8M-874zFnksqMkYho9rtmImVPnL4qWsYCoKLK8JRXVBgoxAGohkcV_PEKLg67a0DJ2jDVM-7nx9R76IZJa21k2UAu9FJZVlIwYW5YzdTRqbooFpYQEkWkTaDtCJ4xB2nB04MG690idh5vt3NAxnVFTZpD0o3nsSPKJa6dmwVpF0TAjrSoKWrc8mPxDv-yhyb9SWNB8-yZZwlkkunHXwrud1gCZWOAwo8GsGhtIUzlXLw6bi8VmJyaFgIjsckcPr9xM3dWCykrK6ZOkOa8yK733A3TzN6EkVP-Tk0-uXNNAGhhcM0mbzxCb88lP-qRMZoafsSd2CYjagwpVuJeWmN7he_46dtXR7NCM6c4nVrN6fR_iqjXyXWQdd0bzmkn1aV7R7aLO5cIOF6WMpPEaid3A9oelvfOvsYr1KyDmMgGbTzKobjbRXvKQ6I9bdvUhXZzey7YJCbXtx6TkZ3hqLq6228Db-R-xzVwgUfCht2iH3G7hNH7l7X9kgpcGpaOylhX1k_aPhnedj8hmZGSqZLyDP9LzhaKCbooWUwiDHFKWhc4UywuiNLayJ8nkZLIqJrNSF1l2Kz96yHRnuI5zAh-4SQ6kzcSecvNajFfLRaLIAz9cOmvZ-RkH29Df754WPqbrb99CDfry4z8lRJb-PMwDNbIB6tVEGwxaPq9NMmm_-Uf7xOjlQ)
