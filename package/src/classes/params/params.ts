import type { RouteUidRequestEventDetails } from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

/**
 * This abstract class is used as a base for web components that want to get
 * params information from a route's path. An instance of this class MUST be an
 * element that is the immediate child of `<r4w-route>`. That's because the
 * route is going to set an attribute on this instance whose name is the route's
 * `uid` property.
 */
export class Params extends HTMLElement {
  private _routeUid: string | undefined;
  private _routerUid: string | undefined;

  constructor() {
    super();

    this.getRouteUids();

    addEventListenerFactory(
      "r4w-params-change",
      window
    )(evt => {
      const {
        detail: { params, routeUid, routerUid }
      } = evt;

      if (this._routeUid === routeUid && this._routerUid === routerUid) {
        this.onParamsChange(params);
      }
    });
  }

  private async getRouteUids() {
    return new Promise<void>(resolve => {
      this.dispatchEvent(
        new CustomEvent<RouteUidRequestEventDetails>("r4w-route-uid-request", {
          bubbles: true,
          composed: true,
          detail: {
            callback: (routeUid, routerUid) => {
              this._routeUid = routeUid;
              this._routerUid = routerUid;
            }
          }
        })
      );

      resolve();
    });
  }

  /**
   * This will be invoked when the params change.
   * @param params A collection of tokens and values.
   */
  protected onParamsChange(params: Record<string, string>): void {}
}
