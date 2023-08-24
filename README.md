# router-4-web-component

A router for web components.

## Usage

See the [package README](./package/README.md).

## Development

Let's change the code in this repo!

### Install

```sh
npm install
```

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
on the fly. See `server/lws-ts-get.mjs`.

The server's configuration file `lws.config.js` has been customized to return
".mjs" files as "text/javascript"
