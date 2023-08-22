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
