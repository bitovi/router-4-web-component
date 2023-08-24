module.exports = {
  mime: { "text/javascript": ["mjs"] },
  rewrite: [
    {
      // source maps
      from: /\/dist\/src\/(.*?)(\.map)$/,
      to: `/dist/src/$1$2`
    },
    {
      // paths to files without extensions will have '.js' appended.
      from: /\/dist\/src\/([^.]+)$/,
      to: `/dist/src/$1.js`
    }
  ],
  stack: [
    "lws-body-parser",
    "lws-request-monitor",
    "lws-log",
    "lws-cors",
    "lws-json",
    "lws-rewrite",
    "lws-blacklist",
    "lws-conditional-get",
    "lws-mime",
    "lws-compress",
    "lws-spa",
    "server/lws-ts-get.mjs",
    "lws-static",
    "lws-index"
  ]
};
