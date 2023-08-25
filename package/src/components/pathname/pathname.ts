import type { OnPathnameMatchChange, PathnameProps } from "../../types.ts";
import { splitPath } from "../../libs/path/path.ts";
import { AttributesBase } from "../attributes-base/attributes-base.ts";

/**
 * This element tells you if the pattern set on it matches the current path and
 * if it has any params from the path.
 */
export class Pathname extends AttributesBase implements PathnameProps {
  _lastMatch: boolean | null = null;
  _listeners: OnPathnameMatchChange[] = [];
  _pathname: string = "";
  _pattern: string | undefined;

  constructor() {
    super();
  }

  protected static override _observedPatterns = ["pattern"];

  static get webComponentName() {
    return "r4w-pathname";
  }

  setPathname(pathname: string): Promise<void> {
    return new Promise(resolve => {
      if (pathname === this._pathname) {
        resolve();
        return;
      }

      this._pathname = pathname;

      // Let the stack unwind, and asynchronously invoke listeners.
      setTimeout(() => {
        const data = getPathnameData(this._pathname, this._pattern);

        if (this._lastMatch === null || this._lastMatch !== data.match)
          for (const listener of this._listeners) {
            listener(data);
          }

        this._lastMatch = data.match;

        resolve();
      }, 0);
    });
  }

  addMatchChangeListener(onMatchChange: OnPathnameMatchChange) {
    this._listeners.push(onMatchChange);
  }
}

if (!customElements.get(Pathname.webComponentName)) {
  customElements.define(Pathname.webComponentName, Pathname);
}

function getPathnameData(
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
