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
- `-d` server root directory = ./src
- `-n` load resources from disk for every request
- `--spa` file to return for 404 = index.html

The server includes a custom middleware component to transpile TypeScript files
on the fly. See `src/server/lws-ts-get.mjs`.

The server's configuration file `lws.config.js` has been customized to return
".mjs" files as "text/javascript"

### API

#### `<r4w-link />`

When the element is clicked browser history is updated with the URL but the
browser does not navigate.

##### Attributes

- `to` The path to the resource this element references.

#### `<r4w-router>`

##### Children

Contains `<r4w-route>` and `<r4w-redirect>` elements.

#### `<r4w-route />`

A route the application can navigate to, usually accessed when the user clicks a
`<r4w-link>` element. Must be a child of `<r4w-router>`. **When activated the
Route will download the associated module using the path \`{path
attribute}.mjs\`**.

##### Attributes

- `path` The path to the resource this element references. This path will have
  ".mjs" appended as the file path to fetch content from the server.

##### Children

Will be displayed when the Route is activated.

#### `<r4w-redirect />`

When included as a child of `<r4w-router>` this will be used to navigate the
browser if none of the `<r4w-route>` elements match the current URL. Must be a
child of `<r4w-router>`.

- `to` The path to the resource this element references.

### Routing Sequence

[![](https://mermaid.ink/img/pako:eNqFlE1v2kAQhv_KaC8lCBMwJhgr4pQeeqhatcol8sFbe4lX2Lvu7pqGIv57Z73-CkTqbfA8M-874zFnksqMkYho9rtmImVPnL4qWsYCoKLK8JRXVBgoxAGohkcV_PEKLg67a0DJ2jDVM-7nx9R76IZJa21k2UAu9FJZVlIwYW5YzdTRqbooFpYQEkWkTaDtCJ4xB2nB04MG690idh5vt3NAxnVFTZpD0o3nsSPKJa6dmwVpF0TAjrSoKWrc8mPxDv-yhyb9SWNB8-yZZwlkkunHXwrud1gCZWOAwo8GsGhtIUzlXLw6bi8VmJyaFgIjsckcPr9xM3dWCykrK6ZOkOa8yK733A3TzN6EkVP-Tk0-uXNNAGhhcM0mbzxCb88lP-qRMZoafsSd2CYjagwpVuJeWmN7he_46dtXR7NCM6c4nVrN6fR_iqjXyXWQdd0bzmkn1aV7R7aLO5cIOF6WMpPEaid3A9oelvfOvsYr1KyDmMgGbTzKobjbRXvKQ6I9bdvUhXZzey7YJCbXtx6TkZ3hqLq6228Db-R-xzVwgUfCht2iH3G7hNH7l7X9kgpcGpaOylhX1k_aPhnedj8hmZGSqZLyDP9LzhaKCbooWUwiDHFKWhc4UywuiNLayJ8nkZLIqJrNSF1l2Kz96yHRnuI5zAh-4SQ6kzcSecvNajFfLRaLIAz9cOmvZ-RkH29Df754WPqbrb99CDfry4z8lRJb-PMwDNbIB6tVEGwxaPq9NMmm_-Uf7xOjlQ?type=png)](https://mermaid.live/edit#pako:eNqFlE1v2kAQhv_KaC8lCBMwJhgr4pQeeqhatcol8sFbe4lX2Lvu7pqGIv57Z73-CkTqbfA8M-874zFnksqMkYho9rtmImVPnL4qWsYCoKLK8JRXVBgoxAGohkcV_PEKLg67a0DJ2jDVM-7nx9R76IZJa21k2UAu9FJZVlIwYW5YzdTRqbooFpYQEkWkTaDtCJ4xB2nB04MG690idh5vt3NAxnVFTZpD0o3nsSPKJa6dmwVpF0TAjrSoKWrc8mPxDv-yhyb9SWNB8-yZZwlkkunHXwrud1gCZWOAwo8GsGhtIUzlXLw6bi8VmJyaFgIjsckcPr9xM3dWCykrK6ZOkOa8yK733A3TzN6EkVP-Tk0-uXNNAGhhcM0mbzxCb88lP-qRMZoafsSd2CYjagwpVuJeWmN7he_46dtXR7NCM6c4nVrN6fR_iqjXyXWQdd0bzmkn1aV7R7aLO5cIOF6WMpPEaid3A9oelvfOvsYr1KyDmMgGbTzKobjbRXvKQ6I9bdvUhXZzey7YJCbXtx6TkZ3hqLq6228Db-R-xzVwgUfCht2iH3G7hNH7l7X9kgpcGpaOylhX1k_aPhnedj8hmZGSqZLyDP9LzhaKCbooWUwiDHFKWhc4UywuiNLayJ8nkZLIqJrNSF1l2Kz96yHRnuI5zAh-4SQ6kzcSecvNajFfLRaLIAz9cOmvZ-RkH29Df754WPqbrb99CDfry4z8lRJb-PMwDNbIB6tVEGwxaPq9NMmm_-Uf7xOjlQ)