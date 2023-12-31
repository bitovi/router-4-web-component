// First, let TypeScript allow all module names starting with "https://". This will suppress TS errors.
declare module "https://*";

// Second, list out all your dependencies. For every URL, you must map it to its local module.
declare module "https://esm.sh/@bitovi/router-4-web-component" {
  export * from "@bitovi/router-4-web-component";
}
