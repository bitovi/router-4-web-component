import type {
  Constructor,
  ParamsChangeEventDetails,
  RouteUidRequestEventDetails
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

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
  return class Params extends baseType {
    #handleParamsChangeBound: ((evt: Event) => void) | undefined;
    #routeUid: string | undefined;
    #routerUid: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * This will be invoked when the params change.
     * @param params A collection of tokens and values.
     * @protected
     */
    _onParamsChange(params: Record<string, string>): void {
      // Default implementation does nothing.
    }

    /**
     * @private
     */
    connectedCallback(): void {
      this.#getRouteUids();

      this.#handleParamsChangeBound = this.#handleParamsChange.bind(this);

      addEventListenerFactory(
        "r4w-params-change",
        window
      )(this.#handleParamsChangeBound);
    }

    /**
     * @private
     */
    disconnectedCallback(): void {
      this.#handleParamsChangeBound &&
        window.removeEventListener(
          "r4w-params-change",
          this.#handleParamsChangeBound
        );

      this.#handleParamsChangeBound = undefined;
    }

    async #getRouteUids() {
      return new Promise<void>(resolve => {
        this.dispatchEvent(
          new CustomEvent<RouteUidRequestEventDetails>(
            "r4w-route-uid-request",
            {
              bubbles: true,
              composed: true,
              detail: {
                callback: (routeUid, routerUid) => {
                  this.#routeUid = routeUid;
                  this.#routerUid = routerUid;
                }
              }
            }
          )
        );

        resolve();
      });
    }

    #handleParamsChange(evt: Event) {
      if (!isParamsChangeEventDetails(evt)) {
        return;
      }

      const {
        detail: { params, routeUid, routerUid }
      } = evt;

      if (this.#routeUid === routeUid && this.#routerUid === routerUid) {
        this._onParamsChange(params);
      }
    }
  };

  function isParamsChangeEventDetails(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evt: any
  ): evt is CustomEvent<ParamsChangeEventDetails> {
    return (
      evt &&
      "detail" in evt &&
      "params" in evt.detail &&
      "routeUid" in evt.detail &&
      "routerUid" in evt.detail
    );
  }
}
