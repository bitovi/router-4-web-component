import type { Constructor } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function TemplateMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class TemplateImpl extends baseType implements Template {
    #templateSrc: string | undefined;
    #templateHtml: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    set templateSrc(src: string) {
      this.setState(
        "#templateSrc",
        this.#templateSrc,
        src,
        next => (this.#templateSrc = next)
      );
    }

    get templateHtml(): string | undefined {
      return this.#templateHtml;
    }

    /******************************************************************
     * ComponentLifecycle
     *****************************************************************/

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      if (changedProperties.includes("#templateSrc")) {
        this.#fetchSrc();
      }

      if (changedProperties.includes("templateHtml")) {
        this.#templateHtml && this._onTemplateReady(this.#templateHtml);
      }
    }

    /******************************************************************
     * protected
     *****************************************************************/

    _getTemplateElement(): HTMLTemplateElement | void {
      if (!this.#templateHtml) {
        return;
      }

      const template = document.createElement(
        "template"
      ) as HTMLTemplateElement;
      template.innerHTML = this.#templateHtml;

      return template;
    }

    /**
     * A protected method that is invoked after the template data has been
     * returned from the server.
     * @protected
     */
    _onTemplateReady(html: string): void {
      // no op
    }

    /******************************************************************
     * private
     *****************************************************************/

    async #fetchSrc() {
      if (!this.#templateSrc) {
        return;
      }

      const src = documentUrl(this.#templateSrc);

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

      this.setState(
        "templateHtml",
        this.#templateHtml,
        html,
        next => (this.#templateHtml = next)
      );
    }
  };
}

interface Template {
  /**
   * Protected method to get a template based on the current HTML.
   */
  _getTemplateElement(): HTMLTemplateElement | void;
  /**
   * A protected method that is invoked after the template data has been
   * returned from the server.
   * @param template
   */
  _onTemplateReady(html: string): void;
  /**
   * The URL to the template html file.
   */
  templateSrc: string;
  /**
   * A template element that contains the HTML fetched from the `templateSrc`.
   */
  readonly templateHtml: string | undefined;
}
