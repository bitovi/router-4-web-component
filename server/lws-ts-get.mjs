import { cwd } from "node:process";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { transform } from "@swc-node/core";

/**
 * lws middleware to read TypeScript files, transform them into JavaScript, and
 * return them in the response as "Content-Type" `text/javascript`. By default
 * the files include an embedded source map.
 *
 * Simply include a path in your code to a TypeScript file whose name ends with
 * ".ts" and the file will be transpiled and returned as the response body.
 */
export default class TsGet {
  middleware(config) {
    return async (ctx, next) => {
      if (ctx.request.path.toUpperCase().endsWith(".TS")) {
        let requestPath = ctx.request.path;
        let configDirectory = config.directory ?? "";

        // Jump through a bunch of hoops just to get the source file name
        // correct in the source map...
        let sourceFilename = path.join(configDirectory, requestPath);
        while (sourceFilename.startsWith(".")) {
          sourceFilename = sourceFilename.slice(1);
        }

        sourceFilename = sourceFilename.startsWith("/")
          ? sourceFilename
          : "/" + sourceFilename;

        // Read the file contents.
        const file = await readFile(
          path.join(cwd(), configDirectory, requestPath),
          { encoding: "utf8" }
        );

        // Finally transform the TS file to a JS file using `swc` and return it
        // in the response.
        const { code } = await transform(file, sourceFilename, {
          module: "es6",
          sourcemap: "inline",
          swc: {
            isModule: true,
            jsc: {
              experimental: {
                plugins: [
                  [
                    "@swc/plugin-transform-imports",
                    {
                      "^(.*?)(\\.ts)$": {
                        "skipDefaultConversion": true,
                        "transform": "{{matches.[1]}}.js"
                      }
                    }
                  ]
                ]
              },
              parser: { syntax: "typescript" },
              target: "esnext"
            }
          }
        });

        ctx.response.body = code;
        ctx.response.set("content-type", "text/javascript");

        return;
      }

      await next();
    };
  }
}
