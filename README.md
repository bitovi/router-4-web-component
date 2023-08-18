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

The server's configuration file `lws.config.js` has been customized to return
".mjs" files as "text/javascript"

### API

#### `<r4w-link />`

When the element is clicked browser history is updated with the URL but the
browser does not navigate.

##### Attributes

- `to` The path to the resource this element references.

#### `<r4w-router>`

Contains `<r4w-route>` and `<r4w-redirect>` elements as children.

#### `<r4w-route />`

A route the application can navigate to, usually accessed when the user clicks a
`<r4w-link>` element. Must be a child of `<rt3wc-router>`. **When activated
the Route will download the associated module using the path \`{path
attribute}.mjs\`**. The downloaded module must implement the `RouteChildModule`
interface; its `init` method is invoked and if the module returns an
`HTMLElement` it will be attached to the DOM.

##### Attributes

- `path` The path to the resource this element references. This path will have
  ".mjs" appended as the file path to fetch content from the server.

#### `<r4w-redirect />`

When included as a child of `<r4w-router>` this will be used to navigate the
browser if none of the `<r4w-route>` elements match the current URL. Must be a
child of `<r4w-router>`.

- `to` The path to the resource this element references.
