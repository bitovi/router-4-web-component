import type { Constructor } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function TemplateMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class TemplateImpl extends baseType implements Template {
    #src: string | undefined;
    #template: HTMLTemplateElement | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    set templateSrc(src: string) {
      this.setState("#src", this.#src, src, next => (this.#src = next));
    }

    get templateElement(): HTMLTemplateElement | undefined {
      return this.#template;
    }

    /******************************************************************
     * ComponentLifecycle
     *****************************************************************/

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      if (changedProperties.includes("#src")) {
        this.#fetchSrc();
      }

      if (changedProperties.includes("#template")) {
        this.#template && this._onTemplateReady(this.#template);
      }
    }

    /******************************************************************
     * protected
     *****************************************************************/

    /**
     * A protected method that is invoked after the template data has been
     * returned from the server.
     * @protected
     */
    _onTemplateReady(template: HTMLTemplateElement): void {
      throw Error("Not implemented. You must override this protected method.");
    }

    /******************************************************************
     * private
     *****************************************************************/

    async #fetchSrc() {
      if (!this.#src) {
        return;
      }

      const src = documentUrl(this.#src);

      let response: Response | undefined;
      try {
        response = await fetch(src);
      } catch {
        response = undefined;
        console.error(`TemplateImpl.fetchSrc: failed to fetch; src='${src}'`);
      }

      if (!response) {
        return;
      }

      const html = await response.text();

      const element = document.createElement("template") as HTMLTemplateElement;
      element.innerHTML = html;

      this.setState(
        "#template",
        this.#template,
        element,
        next => (this.#template = next)
      );
    }
  };
}

interface Template {
  /**
   * A protected method that is invoked after the template data has been
   * returned from the server.
   * @param template
   */
  _onTemplateReady(template: HTMLTemplateElement): void;
  /**
   * The URL to the template html file.
   */
  templateSrc: string;
  /**
   * A template element that contains the HTML fetched from the `templateSrc`.
   */
  readonly templateElement: HTMLTemplateElement | undefined;
}
