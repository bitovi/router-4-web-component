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

### Build

Build the source files (output to "dist" directory).

```sh
npm run build
```

### Scripts

- `build` - generate all run-time and publish-time files.
- `build:copy` - copy files to "dist" required for publishing.
- `build:source` - transpile source TypeScript to JavaScript.
- `build:types` - generate ".d.ts" files in "dist" from TypeScript source.
- `clean` - delete everything in "dist."
- `postbuild` - delete temp files that `tsc` creates.
- `start` - start the development server.

### Dev Server

_The server does not reload automatically._

First run the [build](#build) script then run the following command to start the
server.

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

The server's configuration file `lws.config.js` has been customized with some
rewrite file for router files and source map files.

The server reads from the `app` directory. The files in `app` import router
functionality from the `dist` directory.
