import type { Constructor, RouteUidRequestEventDetails } from "../../types.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function RouteMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class RouteImpl extends baseType implements Route {
    #routeUid: Route["routeUid"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get routeUid(): Route["routeUid"] {
      return this.#routeUid;
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
                "routeUid",
                this.#routeUid,
                routeUid,
                next => (this.#routeUid = next)
              );
            }
          }
        })
      );
    }
  };
}

export interface Route {
  readonly routeUid: string | undefined;
}
