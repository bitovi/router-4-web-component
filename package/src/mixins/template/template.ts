import type { Constructor } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function TemplateMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class TemplateImpl extends baseType implements Template {
    #template_src: string | undefined;
    #template_html: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    set template_src(src: string) {
      this.setState(
        "#template_src",
        this.#template_src,
        src,
        next => (this.#template_src = next)
      );
    }

    get template_html(): string | undefined {
      return this.#template_html;
    }

    /******************************************************************
     * ComponentLifecycle
     *****************************************************************/

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      if (changedProperties.includes("#template_src")) {
        this.#fetchSrc();
      }

      if (changedProperties.includes("template_html")) {
        this.#template_html && this._onTemplateReady(this.#template_html);
      }
    }

    /******************************************************************
     * protected
     *****************************************************************/

    _getTemplateElement(): HTMLTemplateElement | void {
      if (!this.#template_html) {
        return;
      }

      const template = document.createElement(
        "template"
      ) as HTMLTemplateElement;
      template.innerHTML = this.#template_html;

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
      if (!this.#template_src) {
        return;
      }

      const src = documentUrl(this.#template_src);

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
        "template_html",
        this.#template_html,
        html,
        next => (this.#template_html = next)
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
  template_src: string;
  /**
   * A template element that contains the HTML fetched from the `template_src`.
   */
  readonly template_html: string | undefined;
}
