import type { Constructor, RouteActivationProps } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 * Loads a module when the Loader is activated.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function LoaderMixin<T extends Constructor>(baseType: T) {
  return class LoaderImpl extends baseType implements RouteActivationProps {
    #activating = false;
    #loaded = false;
    #loader_src: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    attributeChangedCallback(
      name: string,
      oldValue: string,
      newValue: string
    ): void {
      switch (name) {
        case "src": {
          this.setState(
            "#loader_src",
            this.#loader_src,
            newValue,
            next => (this.#loader_src = next)
          );

          break;
        }
      }
    }

    /******************************************************************
     * RouteActivation
     *****************************************************************/
    async activate(): Promise<void> {
      if (this.#loaded || !this.#loader_src) {
        return;
      }

      if (this.#activating) {
        return;
      }

      this.#activating = true;

      const src = documentUrl(this.#loader_src);
      await import(src);

      this.#activating = false;
      this.#loaded = true;
    }

    deactivate(): void {
      // no-op
    }
  };
}
