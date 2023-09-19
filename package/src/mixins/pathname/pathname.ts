import type { PathnameChangeEventDetails } from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import type { ComponentLifecycle } from "../../libs/component-lifecycle/component-lifecycle.ts";
import type { Route } from "../route/route.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PathnameMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class PathnameImpl extends baseType implements Pathname {
    #handlePathnameChangeBound:
      | ((evt: CustomEvent<PathnameChangeEventDetails>) => void)
      | undefined;
    #pathname: Pathname["pathname"];
    #pattern: Pathname["pattern"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get pathname(): Pathname["pathname"] {
      return this.#pathname;
    }

    get pattern(): Pathname["pattern"] {
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

type Constructor<T = HTMLElement & ComponentLifecycle & Route> = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export interface Pathname {
  readonly pathname: string | undefined;
  readonly pattern: string | undefined;
}
