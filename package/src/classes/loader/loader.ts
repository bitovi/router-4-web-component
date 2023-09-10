import type { RouteActivationProps } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 * Loads a module when the Loader is activated.
 */
export class Loader implements RouteActivationProps {
  #module = false;
  #moduleName: string | undefined;

  get moduleName(): string | undefined {
    return this.#moduleName;
  }

  set moduleName(src: string) {
    this.#moduleName = src;
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  async activate() {
    if (this.#module || !this.#moduleName) {
      return;
    }

    const src = documentUrl(this.#moduleName);

    this.#module = true;
    return import(src);
  }

  deactivate() {
    // no-op
  }
}
