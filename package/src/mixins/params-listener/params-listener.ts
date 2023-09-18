import type {
  Constructor,
  ParamsChangeEventDetails,
  ParamsRequestEventDetails,
  RouteUidRequestEventDetails
} from "../../types.js";
import { addEventListenerFactory } from "../../libs/r4w/r4w.js";

/**
 * Provides route params to a web component when they change.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ParamsListenerMixin<T extends Constructor>(baseType: T) {
  return class ParamsListenerImpl extends baseType implements ParamsListener {
    #handleParamsChangeBound:
      | ((evt: CustomEvent<ParamsChangeEventDetails>) => void)
      | undefined;
    #lastParams: ParamsChangeEventDetails | undefined;
    #params: ParamsChangeEventDetails["params"];
    #requestedRouteUid = false;
    #routeUid: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Get the current params.
     */
    get params(): ParamsChangeEventDetails["params"] {
      return this.#params;
    }

    /******************************************************************
     * Basecomp
     *****************************************************************/
    override componentConnect(): void {
      super.componentConnect && super.componentConnect();

      this.#handleParamsChangeBound = this.#handleParamsChangeEvent.bind(this);
      addEventListenerFactory(
        "r4w-params-change",
        window
      )(this.#handleParamsChangeBound);

      setTimeout(() => {
        this.#dispatchRouteUidRequestEvent();
      }, 0);
    }

    override componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();

      this.#handleParamsChangeBound &&
        window.removeEventListener(
          "r4w-params-change",
          this.#handleParamsChangeBound as (evt: Event) => void
        );

      this.#handleParamsChangeBound = undefined;

      this.#requestedRouteUid = false;
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      if (changedProperties.includes("#routeUid")) {
        this.#dispatchParamsRequestEvent();
      }

      if (
        changedProperties.includes("#lastParams") ||
        changedProperties.includes("#requestedRouteUid") ||
        changedProperties.includes("#routeUid")
      ) {
        if (this.#lastParams && this.#requestedRouteUid) {
          // If this params-listener is used outside a route then params will
          // always be set regardless of the source route.
          let setParams = true;
          if (this.#routeUid) {
            setParams = this.#lastParams.routeUid === this.#routeUid;
          }

          if (setParams) {
            this.setState(
              "#params",
              this.#params,
              this.#lastParams.params,
              next => (this.#params = next)
            );
          }
        }
      }

      if (changedProperties.includes("#params")) {
        this.onParamsChange(this.#params);
      }
    }

    /******************************************************************
     * protected
     *****************************************************************/

    /**
     * Override in your class to be informed when the params for a route change.
     * @param params The new params for the route.
     * @protected
     */
    onParamsChange(params: Record<string, string> | undefined) {
      // Not implemented.
    }

    /******************************************************************
     * private
     *****************************************************************/

    #dispatchParamsRequestEvent() {
      if (!this.#routeUid) {
        return;
      }

      if (this.#lastParams || this.#params) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent<ParamsRequestEventDetails>("r4w-params-request", {
          bubbles: true,
          composed: true,
          detail: { routeUid: this.#routeUid }
        })
      );
    }

    #dispatchRouteUidRequestEvent() {
      this.dispatchEvent(
        new CustomEvent<RouteUidRequestEventDetails>("r4w-route-uid-request", {
          bubbles: true,
          composed: true,
          detail: {
            callback: routeUid =>
              this.setState(
                "#routeUid",
                this.#routeUid,
                routeUid,
                next => (this.#routeUid = next)
              )
          }
        })
      );

      this.setState(
        "#requestedRouteUid",
        this.#requestedRouteUid,
        true,
        next => (this.#requestedRouteUid = next)
      );
    }

    #handleParamsChangeEvent(evt: CustomEvent<ParamsChangeEventDetails>) {
      this.setState(
        "#lastParams",
        this.#lastParams,
        evt.detail,
        next => (this.#lastParams = next)
      );
    }
  };
}

export interface ParamsListener {
  onParamsChange(params: Record<string, string> | undefined): void;
}
