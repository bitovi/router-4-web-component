import { ariaAttributes } from "https://esm.sh/aria-attributes@2";
import { htmlElementAttributes } from "https://esm.sh/html-element-attributes@3";

/**
 * Get the names of the attributes associated with a DOM element. Note that all
 * "ARIA" tags are returned regardless of the value of `element`.
 * @param element An element tag name like 'a' or 'div'.
 * @param filter Tag names that should be filtered out and NOT included in the
 * return value.
 * @returns The filtered list of attribute names for the provided element.
 */
export function getAttributeNames(
  element: keyof HTMLElementTagNameMap,
  ...filter: string[]
): string[] {
  let names = [
    ...htmlElementAttributes[element],
    ...htmlElementAttributes["*"],
    ...ariaAttributes
  ];

  if (filter && filter.length) {
    names = names.filter(name => !filter.includes(name));
  }

  return names;
}
