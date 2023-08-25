module.exports = {
  mime: { "text/javascript": ["mjs"] },
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
