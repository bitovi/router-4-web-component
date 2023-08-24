# router-4-web-component

A router for web components.

## Install

```sh
npm install
```

## Development

### Dev Server

Does not reload automatically.

```sh
npm run start
```

Open a browser and navigate to http://localhost:3000/.

The `local-web-server` is started with the following options:

- `--hostname` host = localhost
- `-p` port = 3000
- `-d` server root directory = ./ _(project root directory)_
- `-n` load resources from disk for every request
- `--spa` file to return for 404 = app/src/index.html

The server includes a custom middleware component to transpile TypeScript files
on the fly. See `src/server/lws-ts-get.mjs`.

The server's configuration file `lws.config.js` has been customized to return
".mjs" files as "text/javascript"

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
