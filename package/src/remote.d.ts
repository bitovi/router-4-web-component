// First, let TypeScript allow all module names starting with "https://". This
// will suppress TS errors.
declare module "https://*";

// Second, list out all your dependencies. For every URL, you must map it to its
// local module.
declare module "https://esm.sh/html-element-attributes@3" {
  export * from "html-element-attributes";
}

declare module "https://esm.sh/aria-attributes@2" {
  export * from "aria-attributes";
}
