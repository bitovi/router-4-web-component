import { cwd } from "node:process";
import * as path from "node:path";
import { readFile } from "node:fs/promises";
import { transform } from "@swc-node/core";

/**
 * lws middleware to read TypeScript files, transform them into JavaScript, and
 * return them in the response.
 */
export default class TsGet {
  middleware(config) {
    return async (ctx, next) => {
      if (ctx.request.path.toUpperCase().endsWith(".TS")) {
        // Jump through a bunch of hoops just to get the source file name
        // correct in the source map...
        let sourceFilename = path.join(config.directory, ctx.request.path);
        while (sourceFilename.startsWith(".")) {
          sourceFilename = sourceFilename.slice(1);
        }

        sourceFilename = sourceFilename.startsWith("/")
          ? sourceFilename
          : "/" + sourceFilename;

        // Read the file contents.
        const file = await readFile(
          path.join(cwd(), config.directory, ctx.request.path),
          { encoding: "utf8" }
        );

        // Finally transform the TS file to a JS file and return it in the
        // response.
        const { code } = await transform(file, sourceFilename, {
          target: "es2022",
          sourcemap: "inline",
          swc: {
            module: { strictMode: false, type: "es6" },
            jsc: { parser: { syntax: "typescript" } }
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