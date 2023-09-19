import type { Constructor, PathnameChangeEventDetails } from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { RouteMixin } from "../route/route.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PathnameMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class Pathname extends RouteMixin(BasecompMixin(baseType)) {
    #handlePathnameChangeBound:
      | ((evt: CustomEvent<PathnameChangeEventDetails>) => void)
      | undefined;
    #pathname: string | undefined;
    #pattern: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get pathname(): string | undefined {
      return this.#pathname;
    }

    get pattern(): string | undefined {
      return this.#pattern;
    }

    /******************************************************************
     * Basecomp
     *****************************************************************/

    override componentConnect(): void {
      super.componentConnect && super.componentConnect();
      this.#connectListeners();
    }

    override componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();
      this.#disconnectListeners();
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);
    }

    /******************************************************************
     * private
     *****************************************************************/

    #connectListeners() {
      this.#handlePathnameChangeBound =
        this.#handlePathnameChangeEvent.bind(this);
      addEventListenerFactory(
        "r4w-pathname-change",
        window
      )(this.#handlePathnameChangeBound);
    }

    #disconnectListeners() {
      this.#handlePathnameChangeBound &&
        window.removeEventListener(
          "r4w-pathname-change",
          this.#handlePathnameChangeBound as (evt: Event) => void
        );

      this.#handlePathnameChangeBound = undefined;
    }

    #handlePathnameChangeEvent(evt: CustomEvent<PathnameChangeEventDetails>) {
      const {
        detail: { pathname, pattern, routeUid }
      } = evt;

      if (this.routeUid !== routeUid) {
        return;
      }

      this.setState(
        "pathname",
        this.#pathname,
        pathname,
        next => (this.#pathname = next)
      );

      this.setState(
        "pattern",
        this.#pattern,
        pattern,
        next => (this.#pattern = next)
      );
    }
  };
}
