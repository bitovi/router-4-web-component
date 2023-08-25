import type { PathnameProps } from "../../types.ts";
import { splitPath } from "../../libs/path/path.ts";
import { AttributesBase } from "../attributes-base/attributes-base.ts";

/**
 * This element tells you if the pattern set on it matches the current path and
 * if it has any params from the path.
 */
export class Pathname extends AttributesBase implements PathnameProps {
  _pattern: string | undefined;

  constructor() {
    super();
  }

  protected static _observedPatterns = ["pattern"];

  static get webComponentName() {
    return "r4w-pathname";
  }

  getPathnameData(
    pathname: string
  ): ReturnType<PathnameProps["getPathnameData"]> {
    if (!this._pattern) {
      return { match: false };
    }

    if (this._pattern.indexOf(":") < 0) {
      const match = this._pattern === pathname;
      return match ? { match: true, params: {} } : { match: false };
    }

    const pathnameData = splitPath(pathname);
    const patternData = splitPath(this._pattern);

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

function getData(
  pattern: string | undefined,
  pathname: string = window.location.pathname
):
  | {
      match: false;
    }
  | {
      match: true;
      params: Record<string, string>;
    } {
  if (!pattern) {
    return { match: false };
  }

  if (pattern.indexOf(":") < 0) {
    const match = pattern === pathname;
    match ? { match, params: {} } : { match };
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
