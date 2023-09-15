import type { Constructor, RouteActivationProps } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 * Loads a module when the Loader is activated.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function LoaderMixin<T extends Constructor>(baseType: T) {
  return class Loader extends baseType implements RouteActivationProps {
    #module = false;
    #moduleName: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get moduleName(): string | undefined {
      return this.#moduleName;
    }

    set moduleName(src: string) {
      this.#moduleName = src;
    }

    /******************************************************************
     * RouteActivation
     *****************************************************************/
    async activate(): Promise<void> {
      if (this.#module || !this.#moduleName) {
        return;
      }

      const src = documentUrl(this.#moduleName);

      this.#module = true;
      return import(src);
    }

    deactivate(): void {
      // no-op
    }
  };
}

// export const LoaderMixin = LoaderFactory(BasecompMixin(HTMLElement));
