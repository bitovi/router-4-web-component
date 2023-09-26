import type { Constructor } from "../../types.ts";
import { documentUrl } from "../../libs/url/url.ts";

/**
 * Supports basic "handlebars" type templates with replaceable tokens. Each
 * token must start with "{{" and ends with "}}". The string between the braces
 * is used as the key into an object with a replacement value.
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

    /**
     * A protected method that is invoked after the template data has been
     * returned from the server.
     * @protected
     */
    _onTemplateReady(html: string): void {
      // no op
    }

    /**
     * Invoked by the class that extends this mixin after the template has been
     * downloaded. Supports basic "handlebars" type templates with replaceable
     * tokens in the value of `template_html`. Each token must start with "{{" and
     * ends with "}}". The string between the braces is used as the key into the
     * Record that's passed into this function via the `replacements` param.
     *
     * For example if
     *  - template_html = "Hello {{name}}!"
     *  - replacements = `{ name: "Alice", age: 30 }`
     *
     * then the method would return
     *  - "Hello Alice!"
     * @param replacements A collection of key:value pairs where a key matches the
     * contents of a token.
     * @returns The value of `template_html` with the tokens replaced.
     * @protected
     */
    _replace(replacements: Record<string, unknown>): string | undefined {
      if (!this.#template_html) {
        return;
      }

      // I'm not sure but it seems like getting all the matches at once,
      // converting them to an array, and iterating backward over the matches -
      // to preserve the `index` in each match - is the most efficient way to do
      // most template replacements. This might not be true if there are
      // thousands of matches...
      let output = this.#template_html;
      const matches = output.matchAll(/({{)([^]+?)(}})/g);
      const arrMatches = [...matches];

      if (!matches || !arrMatches.length) {
        return output;
      }

      for (let i = arrMatches.length - 1; 0 <= i; i--) {
        const match = arrMatches[i];
        if (!match.index && match.index !== 0) {
          continue;
        }

        const groupKey = match[2];
        if (groupKey in replacements) {
          const right = match.index + 2 + groupKey.length + 2;
          output =
            output.slice(0, match.index) +
            `${replacements[groupKey]}` +
            output.slice(right);
        }
      }

      return output;
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
   * A protected method that is invoked after the template data has been
   * returned from the server.
   * @param html The HTML string with tokens; i.e. the HTML downloaded from
   * `template_src`.
   * @protected
   */
  _onTemplateReady(html: string): void;
  /**
   * Invoked by the class that extends this mixin after the template has been
   * downloaded. Supports basic "handlebars" type templates with replaceable
   * tokens in the value of `template_html`. Each token must start with "{{" and
   * ends with "}}". The string between the braces is used as the key into the
   * Record that's passed into this function via the `replacements` param.
   *
   * For example if
   *  - template_html = "Hello {{name}}!"
   *  - replacements = `{ name: "Alice", age: 30 }`
   *
   * then the method would return
   *  - "Hello Alice!"
   * @param replacements A collection of key:value pairs where a key matches the
   * contents of a token.
   * @returns The value of `template_html` with the tokens replaced.
   * @protected
   */
  _replace(replacements: Record<string, unknown>): string | undefined;
  /**
   * The URL to the template html file.
   */
  template_src: string;
  /**
   * A template element that contains the HTML fetched from the `template_src`.
   */
  readonly template_html: string | undefined;
}
