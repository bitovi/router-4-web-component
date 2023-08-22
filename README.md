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

[![](https://mermaid.ink/img/pako:eNp9VE1vozAQ_Ssjn0hE0oQkLUFVLtvraitVvaw44BonoILNGtNtNsp_3xkM-SBVLzDA83tvnsccmNCpZBGr5Z9GKiGfcr4zvIwVQMWNzUVecWWhUO_Aa3g0y7-TIlfvmyGgauqMEHR_sdzKxzcDdxvv2ejP_WiINrqx0pwY3ePmS9Q16AYjmtrqsgW5ciJ0WWkllb3B1tJ8OFVXxYoQRgqU2r15wWLlQzCny2rVWgZQGh1oWoUJ-G5ZBM98J6HQPK0dqmtnstm0_UcgjMQIIDmlkUBFQRBcqpRuV8wRvCI3iCIX7zVQwASh0M-cdPUSqxOXJuVNH502eiL-qVavpviRcbWTXtKYwoELrSuQqLUHkeVFOgx00ENbRlByK7JnbjNvdAW6krWmkXAHW17U8qI7XlhAeUi1rKlVR3aTVqeUSi5s_oE59VIDoQh3qcSwOvtbg1v-9OtnK4jCrdR4TGLj8fdSKHSpQz5PHjPeKwz6pfX93uc4XcZ6SYXBJKdgutGaXDmucQ5dKqdcvuis1A3NcdtYrvq2APpIuhF3L7txp-WupPC2uZJezIbzH7PRxY6cM74gPA9hz3Z7ivAg323ymrzZTJI_5rNSmpLnKf44DsQTM_xUyphFWKIh3hQoH6sjQnlj9cteCRbRrPisqVI00f1nWNROjs_wgLLowD5ZNJk_LGbTxWw2W4ZhEM6Dlc_29HodBtPZ_Tx4WAfr-_BhdfTZP62RIpiG4XKF-OVisVyusWj5frcfSfT4HyAAocs?type=png)](https://mermaid.live/edit#pako:eNp9VE1vozAQ_Ssjn0hE0oQkLUFVLtvraitVvaw44BonoILNGtNtNsp_3xkM-SBVLzDA83tvnsccmNCpZBGr5Z9GKiGfcr4zvIwVQMWNzUVecWWhUO_Aa3g0y7-TIlfvmyGgauqMEHR_sdzKxzcDdxvv2ejP_WiINrqx0pwY3ePmS9Q16AYjmtrqsgW5ciJ0WWkllb3B1tJ8OFVXxYoQRgqU2r15wWLlQzCny2rVWgZQGh1oWoUJ-G5ZBM98J6HQPK0dqmtnstm0_UcgjMQIIDmlkUBFQRBcqpRuV8wRvCI3iCIX7zVQwASh0M-cdPUSqxOXJuVNH502eiL-qVavpviRcbWTXtKYwoELrSuQqLUHkeVFOgx00ENbRlByK7JnbjNvdAW6krWmkXAHW17U8qI7XlhAeUi1rKlVR3aTVqeUSi5s_oE59VIDoQh3qcSwOvtbg1v-9OtnK4jCrdR4TGLj8fdSKHSpQz5PHjPeKwz6pfX93uc4XcZ6SYXBJKdgutGaXDmucQ5dKqdcvuis1A3NcdtYrvq2APpIuhF3L7txp-WupPC2uZJezIbzH7PRxY6cM74gPA9hz3Z7ivAg323ymrzZTJI_5rNSmpLnKf44DsQTM_xUyphFWKIh3hQoH6sjQnlj9cteCRbRrPisqVI00f1nWNROjs_wgLLowD5ZNJk_LGbTxWw2W4ZhEM6Dlc_29HodBtPZ_Tx4WAfr-_BhdfTZP62RIpiG4XKF-OVisVyusWj5frcfSfT4HyAAocs)
