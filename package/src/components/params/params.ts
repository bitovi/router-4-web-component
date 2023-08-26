import type { ParamsChangeEventDetails } from "../../types.js";
import { findParentRoute } from "../../libs/r4w/r4w.js";

export abstract class Params extends HTMLElement {
  constructor() {
    super();

    window.addEventListener("r4w-params-change", evt => {
      const route = findParentRoute(this.parentElement);
      if (!route) {
        throw Error(
          "Could not found a Route ancestor. Param based element must be a child of an <r4w-route> element."
        );
      }

      const {
        detail: { params, routeUid }
      } = evt as CustomEvent<ParamsChangeEventDetails>;

      if (routeUid !== route.uid) {
        return;
      }

      this.onParamsChange(params);
    });
  }

  protected abstract onParamsChange(params: Record<string, string>): void;
}
