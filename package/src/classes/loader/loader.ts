import type { RouteActivationProps, WebComponent } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 * Loads a module when the Loader is activated.
 */
export class Loader implements RouteActivationProps {
  private _module = false;
  private _moduleName: string | undefined;

  get moduleName(): string | undefined {
    return this._moduleName;
  }

  set moduleName(src: string) {
    this._moduleName = src;
  }

  /******************************************************************
   * RouteActivation
   *****************************************************************/
  async activate() {
    if (this._module || !this._moduleName) {
      return;
    }

    const src = documentUrl(this._moduleName);

    this._module = true;
    return import(src);
  }

  deactivate() {
    // no-op
  }
}
