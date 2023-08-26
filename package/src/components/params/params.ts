import type { ParamsChangeEventDetails } from "../../types.js";

/**
 * This abstract class is used as a base for web components that want to get
 * params information from a route's path. An instance of this class MUST be an
 * element that is the immediate child of `<r4w-route>`. That's because the
 * route is going to set an attribute on this instance whose name is the route's
 * `uid` property.
 */
export abstract class Params extends HTMLElement {
  constructor() {
    super();

    window.addEventListener("r4w-params-change", evt => {
      const {
        detail: { params, routeUid, routerUid }
      } = evt as CustomEvent<ParamsChangeEventDetails>;

      // When an event arrives we check and see if the event's source `routeUid`
      // matches an attribute on this instance.
      this.hasAttribute(routerUid) &&
        this.hasAttribute(routeUid) &&
        this.onParamsChange(params);
    });
  }

  protected abstract onParamsChange(params: Record<string, string>): void;
}
