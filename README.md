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
- `--spa` file to return when a URL path does not lead to a file

Its configuration file `lws.config.js` has been customized to return mjs files
as "text/javascript"

### API

#### `<rt4wc-link />`

Creates an `<a>` element in the DOM. When the element is clicked history is
updated with the URL but the browser does not navigate.

##### Attributes

- `to` The path to the resource this element references.

#### `<rt4wc-router>`

Contains `<rt4wc-route>` and `<rt4wc-redirect>` elements as children.

#### `<rt4wc-route />`

A route the application can navigate to, usually accessed when the user clicks a
`<rt4wc-link>` element. When activate a Route will download a module using the
path '`{path attribute}.mjs`'. The downloaded module must implement the
`RouteChildModule` interface. The `init` method is invoked and if the module
returns an `HTMLElement` it will be attached to the DOM.

##### Attributes

- `path` The path to the resource this element references. This path will have
  ".mjs" appended as file path to fetch content from the server.

#### `<rt4wc-redirect />`

When included as a child of `<rt4wc-router>` this will be used to navigate the
browser if none of the `<rt4wc-route>` elements match the current URL.

- `to` The path to the resource this element references.
