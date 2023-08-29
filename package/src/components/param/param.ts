import type { OnParamsChange } from "../../types.ts";
import { findParentRouter } from "../../libs/r4w/r4w.ts";

export abstract class Param extends HTMLElement {
  constructor() {
    super();

    window.addEventListener("r4w-params-change", evt => {
      const router = findParentRouter(this.parentElement);
      if (!router) {
        throw Error(
          "Could not found a Router ancestor. Param based element must be a child of an <r4w-router> element."
        );
      }

      const {
        detail: { params, routerUid }
      } = evt as CustomEvent<OnParamsChange>;

      if (routerUid !== router.uid) {
        return;
      }

      this.onParamsChange(params);
    });
  }

  protected abstract onParamsChange(params: Record<string, string>): void;
}

interface Params {}
