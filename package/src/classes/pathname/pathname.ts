import type { OnPathnameMatchChange, PathnameProps } from "../../types.ts";
import { splitPath } from "../../libs/url/url.ts";

/**
 * This element tells you if the pattern set on it matches the current path and
 * if it has any params from the path.
 */
export class Pathname implements PathnameProps {
  #lastMatch: boolean | null = null;
  #listeners: OnPathnameMatchChange[] = [];
  #lastPathname: string = "";
  protected _pattern: string | undefined;

  /**
   * Returns data about a path: does it match the provided pathname pattern, any
   * params extracted from the pathname.
   * @param pathname A pathname - usually the current browser path.
   * @param pattern A route pattern - usually the `path` from an `<r4w-route>`.
   */
  static getPathnameData(
    pathname: string,
    pattern?: string
  ): Parameters<OnPathnameMatchChange>[0] {
    if (!pattern) {
      return { match: false };
    }

    if (pattern.indexOf(":") < 0) {
      const match = pattern === pathname;
      return match ? { match: true, params: {} } : { match: false };
    }

    const pathnameData = splitPath(pathname);
    const patternData = splitPath(pattern);

    if (pathnameData.parts.length !== patternData.parts.length) {
      return { match: false };
    }

    if (pathnameData.absolute !== patternData.absolute) {
      return { match: false };
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patternData.parts.length; i++) {
      let matched = false;

      const pathnameDecoded = decodeURIComponent(pathnameData.parts[i]);
      const patternDecoded = decodeURIComponent(patternData.parts[i]);

      if (patternDecoded.startsWith(":")) {
        params[patternDecoded.slice(1)] = pathnameDecoded;
        matched = true;
      } else {
        matched = pathnameDecoded === patternDecoded;
      }

      if (!matched) {
        return { match: false };
      }
    }

    return { match: true, params };
  }

  get pattern(): string | undefined {
    return this._pattern;
  }

  set pattern(pattern: string) {
    this._pattern = pattern;
  }

  /******************************************************************
   * PathnameProps
   *****************************************************************/
  addMatchChangeListener(onMatchChange: OnPathnameMatchChange): void {
    this.#listeners.push(onMatchChange);
  }

  setPathname(pathname: string): Promise<void> {
    return new Promise(resolve => {
      if (pathname === this.#lastPathname) {
        resolve();
        return;
      }

      this.#lastPathname = pathname;

      // Let the stack unwind, and asynchronously invoke listeners.
      setTimeout(() => {
        const data = Pathname.getPathnameData(
          this.#lastPathname,
          this._pattern
        );

        if (this.#lastMatch === null || this.#lastMatch !== data.match)
          for (const listener of this.#listeners) {
            listener(data);
          }

        this.#lastMatch = data.match;

        resolve();
      }, 0);
    });
  }
}
