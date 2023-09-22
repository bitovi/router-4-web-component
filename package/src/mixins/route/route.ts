import type { Constructor, RouteUidRequestEventDetails } from "../../types.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function RouteMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class RouteImpl extends baseType implements Route {
    #routemx_routeUid: Route["routemx_routeUid"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get routemx_routeUid(): Route["routemx_routeUid"] {
      return this.#routemx_routeUid;
    }

    /******************************************************************
     * Basecomp
     *****************************************************************/

    override componentConnect(): void {
      super.componentConnect && super.componentConnect();
      setTimeout(() => this.#dispatchRouteUidRequestEvent(), 0);
    }

    /******************************************************************
     * private
     *****************************************************************/

    #dispatchRouteUidRequestEvent() {
      // console.log("Params.#dispatchRouteUidRequestEvent: dispatch 'r4w-route-uid-request'.");

      this.dispatchEvent(
        new CustomEvent<RouteUidRequestEventDetails>("r4w-route-uid-request", {
          bubbles: true,
          composed: true,
          detail: {
            callback: routeUid => {
              this.setState(
                "routemx_routeUid",
                this.#routemx_routeUid,
                routeUid,
                next => (this.#routemx_routeUid = next)
              );
            }
          }
        })
      );
    }
  };
}

export interface Route {
  readonly routemx_routeUid: string | undefined;
}
