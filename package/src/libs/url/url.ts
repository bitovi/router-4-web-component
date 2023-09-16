import type { OnPathnameMatchChange } from "../../types.ts";

/**
 * Splits a path using '/' as the separator.
 * @param path Must be an **encoded** URL path.
 * @returns The parts of URL, these will still be **encoded**.
 */
export function splitPath(path: string): {
  absolute: boolean;
  parts: string[];
} {
  const absolute = path.startsWith("/");

  let safePath = path.trim();
  while (safePath.length && safePath.startsWith("/")) {
    safePath = safePath.slice(1);
  }

  const parts = safePath.split("/");

  return { absolute, parts };
}

/**
 * Creates a URL from input `url` whose origin is the `document` origin.
 */
export function documentUrl(url: string): string {
  const docUrl = new URL(document.baseURI);
  const inputUrl = new URL(url, document.baseURI);

  // If both the doc URL and input URL have the same origin then the input URL
  // is relative to the document and there is nothing to do. If they don't match
  // create a URL whose origin is the document but from the pathname on is from
  // the input URL.
  let outputUrl = new URL(url, document.baseURI);
  if (docUrl.origin !== inputUrl.origin) {
    outputUrl = new URL(docUrl);
    outputUrl.pathname = inputUrl.pathname;
    outputUrl.search = inputUrl.search;
    outputUrl.hash = inputUrl.hash;
  }

  return outputUrl.toString();
}

/**
 * Returns data about a path: does it match the provided pathname pattern, any
 * params extracted from the pathname.
 * @param pathname A pathname - usually the current browser path.
 * @param pattern A route pattern - usually the `path` from an `<r4w-route>`.
 */
export function getPathnameData(
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
