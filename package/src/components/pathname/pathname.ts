import type {
  OnPathnameMatchChange,
  PathnameProps,
  WebComponent
} from "../../types.ts";
import { splitPath } from "../../libs/path/path.ts";

/**
 * This element tells you if the pattern set on it matches the current path and
 * if it has any params from the path.
 *
 * Attributes:
 *   - pattern {string} pattern that will be compared to a pathname to see if they match.
 */
export class Pathname
  extends HTMLElement
  implements PathnameProps, WebComponent
{
  private _lastMatch: boolean | null = null;
  private _listeners: OnPathnameMatchChange[] = [];
  private _lastPathname: string = "";
  protected _pattern: string | undefined;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ["pattern"];
  }

  static get webComponentName() {
    return "r4w-pathname";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "pattern") {
      this._pattern = newValue;
    }
  }

  /******************************************************************
   * PathnameProps
   *****************************************************************/
  addMatchChangeListener(onMatchChange: OnPathnameMatchChange) {
    this._listeners.push(onMatchChange);
  }

  setPathname(pathname: string): Promise<void> {
    return new Promise(resolve => {
      if (pathname === this._lastPathname) {
        resolve();
        return;
      }

      this._lastPathname = pathname;

      // Let the stack unwind, and asynchronously invoke listeners.
      setTimeout(() => {
        const data = this._getPathnameData(this._lastPathname, this._pattern);

        if (this._lastMatch === null || this._lastMatch !== data.match)
          for (const listener of this._listeners) {
            listener(data);
          }

        this._lastMatch = data.match;

        resolve();
      }, 0);
    });
  }

  protected _getPathnameData(
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
}

if (!customElements.get(Pathname.webComponentName)) {
  customElements.define(Pathname.webComponentName, Pathname);
}

/**
 * This will be needed in the near future I think.
 */
function paramsChanged(
  next: Record<string, string>,
  current?: Record<string, string>
): boolean {
  if (!current) {
    return true;
  }

  const nextKeys = Object.keys(next);
  const currentKeys = Object.keys(current);

  if (nextKeys.length !== currentKeys.length) {
    return true;
  }

  for (let i = 0; i < currentKeys.length; i++) {
    const nextValue = next[nextKeys[i]];
    const currentValue = current[currentKeys[i]];

    if (nextValue !== currentValue) {
      return true;
    }
  }

  return false;
}
