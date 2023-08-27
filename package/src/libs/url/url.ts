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
