import type { Constructor, PathnameChangeEventDetails } from "../../types.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";

/**
 * This abstract class is used as a base for web components that want to get
 * params information from a route's path. An instance of this class MUST be an
 * element that is the immediate child of `<r4w-route>`. That's because the
 * route is going to set an attribute on this instance whose name is the route's
 * `uid` property.
 *
 * Can be used as a mixin definition.
 * https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ParamsMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class Params extends BasecompMixin(baseType) {
    #handleParamsChangeBound: ((evt: Event) => void) | undefined;
    #pattern: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /** The pattern that will be used to determine when a changed pathname is
     * for this class instance. */
    get pattern(): string | undefined {
      return this.#pattern;
    }

    set pattern(pattern: string | undefined) {
      this.setState(
        "pattern",
        this.#pattern,
        pattern,
        next => (this.#pattern = next)
      );
    }

    /**
     * This will be invoked when the params change.
     * @param params A collection of tokens and values.
     * @protected
     */
    onParamsChange(params: Record<string, string>): void {
      super.onParamsChange && super.onParamsChange(params);
    }

    /******************************************************************
     * Basecomp
     *****************************************************************/
    override componentConnect(): void {
      super.componentConnect && super.componentConnect();

      this.#handleParamsChangeBound = this.#handleParamsChange.bind(this);

      addEventListenerFactory(
        "r4w-pathname-change",
        document
      )(this.#handleParamsChangeBound);
    }

    override componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();

      this.#handleParamsChangeBound &&
        window.removeEventListener(
          "r4w-pathname-change",
          this.#handleParamsChangeBound
        );

      this.#handleParamsChangeBound = undefined;
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);
    }

    #handleParamsChange(evt: Event) {
      if (!isPathnameChangeEventDetails(evt)) {
        return;
      }

      const {
        detail: { pathname }
      } = evt;

      const { match, params } = getPathnameData(pathname, this.pattern);

      match && params && this.onParamsChange(params);
    }
  };

  function isPathnameChangeEventDetails(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evt: any
  ): evt is CustomEvent<PathnameChangeEventDetails> {
    return evt && "detail" in evt && "pathname" in evt.detail;
  }
}
