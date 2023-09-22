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
    #paramslistener_lastParams: ParamsChangeEventDetails | undefined;
    #paramslistener_params: ParamsChangeEventDetails["params"];
    #paramslistener_requestedRouteUid = false;
    #paramslistener_routeUid: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Get the current paramslistener_params.
     */
    get paramslistener_params(): ParamsChangeEventDetails["params"] {
      return this.#paramslistener_params;
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

      this.#paramslistener_requestedRouteUid = false;
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      // console.log(
      //   `ParamsListener.update: changedProperties='${changedProperties.join(
      //     ", "
      //   )}'`
      // );

      if (changedProperties.includes("#paramslistener_routeUid")) {
        this.#dispatchParamsRequestEvent();
      }

      if (
        changedProperties.includes("#paramslistener_lastParams") ||
        changedProperties.includes("#paramslistener_requestedRouteUid") ||
        changedProperties.includes("#paramslistener_routeUid")
      ) {
        if (
          this.#paramslistener_lastParams &&
          this.#paramslistener_requestedRouteUid
        ) {
          // If this params-listener is used outside a route then params will
          // always be set regardless of the source route.
          let setParams = true;
          if (this.#paramslistener_routeUid) {
            setParams =
              this.#paramslistener_lastParams.routeUid ===
              this.#paramslistener_routeUid;
          }

          if (setParams) {
            this.setState(
              "#paramslistener_params",
              this.#paramslistener_params,
              this.#paramslistener_lastParams.params,
              next => (this.#paramslistener_params = next)
            );
          }
        }
      }

      if (changedProperties.includes("#paramslistener_params")) {
        this._onParamsChange(this.#paramslistener_params);
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
    _onParamsChange(params: Record<string, string> | undefined) {
      // Not implemented.
    }

    /******************************************************************
     * private
     *****************************************************************/

    #dispatchParamsRequestEvent() {
      if (!this.#paramslistener_routeUid) {
        return;
      }

      if (this.#paramslistener_lastParams || this.#paramslistener_params) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent<ParamsRequestEventDetails>("r4w-params-request", {
          bubbles: true,
          composed: true,
          detail: { routeUid: this.#paramslistener_routeUid }
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
                "#paramslistener_routeUid",
                this.#paramslistener_routeUid,
                routeUid,
                next => (this.#paramslistener_routeUid = next)
              )
          }
        })
      );

      this.setState(
        "#paramslistener_requestedRouteUid",
        this.#paramslistener_requestedRouteUid,
        true,
        next => (this.#paramslistener_requestedRouteUid = next)
      );
    }

    #handleParamsChangeEvent(evt: CustomEvent<ParamsChangeEventDetails>) {
      this.setState(
        "#paramslistener_lastParams",
        this.#paramslistener_lastParams,
        evt.detail,
        next => (this.#paramslistener_lastParams = next)
      );
    }
  };
}

export interface ParamsListener {
  _onParamsChange(params: Record<string, string> | undefined): void;
}
