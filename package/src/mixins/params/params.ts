import type {
  ParamsChangeEventDetails,
  ParamsRequestEventDetails,
  PathnameRequestEventDetails
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import type { Pathname } from "../pathname/pathname.ts";
import type { Route } from "../route/route.ts";
import type { ComponentLifecycle } from "../../libs/component-lifecycle/component-lifecycle.ts";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ParamsMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class ParamsImpl extends baseType implements Params {
    #handleParamsRequestEventBound:
      | ((evt: CustomEvent<ParamsRequestEventDetails>) => void)
      | undefined;
    #params: Params["params"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...cArgs: any[]) {
      super(...cArgs);
    }

    get params(): Params["params"] {
      return this.#params;
    }

    /******************************************************************
     * ComponentLifecycle
     *****************************************************************/

    override componentConnect(): void {
      super.componentConnect && super.componentConnect();

      // console.log("Params.componentConnect");

      this.#connectListeners();
    }

    override componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();
      this.#disconnectListeners();
    }

    override stateComparison<T>(
      property: string,
      oldValue: T,
      newValue: T
    ): boolean {
      if (property === "params") {
        const oldParams = oldValue as Params["params"];
        const newParams = newValue as Params["params"];
        if (!oldParams && !newParams) {
          return true;
        }

        if (oldParams && newParams) {
          const oldKeys = Object.keys(oldParams);
          const newKeys = Object.keys(newParams);
          if (oldKeys.length !== newKeys.length) {
            return false;
          } else {
            const keysSame = oldKeys.every(ok => newKeys.some(nk => ok === nk));
            if (!keysSame) {
              return false;
            }

            const valuesSame = oldKeys.every(
              ok => oldParams[ok] === newParams[ok]
            );

            return valuesSame;
          }
        }

        return false;
      }

      return super.stateComparison
        ? super.stateComparison(property, oldValue, newValue)
        : false;
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);

      if (changedProperties.includes("routeUid")) {
        this.#dispatchPathnameRequestEvent();
      }

      if (
        changedProperties.includes("pathname") ||
        changedProperties.includes("pattern") ||
        changedProperties.includes("routeUid")
      ) {
        if (this.pathname && this.pattern && this.routeUid) {
          const { match, params } = getPathnameData(
            this.pathname,
            this.pattern
          );
          if (match) {
            this.setState(
              "params",
              this.#params,
              params,
              next => (this.#params = next)
            );
          }
        }
      }

      if (changedProperties.includes("params")) {
        this.#dispatchParamsChangedEvent();
      }
    }

    /******************************************************************
     * private
     *****************************************************************/

    #connectListeners() {
      this.#handleParamsRequestEventBound =
        this.#handleParamsRequestEvent.bind(this);
      addEventListenerFactory(
        "r4w-params-request",
        window
      )(this.#handleParamsRequestEventBound);
    }

    #disconnectListeners() {
      this.#handleParamsRequestEventBound &&
        window.removeEventListener(
          "r4w-params-request",
          this.#handleParamsRequestEventBound as (evt: Event) => void
        );

      this.#handleParamsRequestEventBound = undefined;
    }

    #dispatchParamsChangedEvent() {
      if (!this.routeUid) {
        return;
      }

      // console.log(
      //   `Params.#dispatchParamsChangedEvent: dispatching; params='${
      //     this.#params
      //   }', routeUid='${this.routeUid}'`
      // );

      window.dispatchEvent(
        new CustomEvent<ParamsChangeEventDetails>("r4w-params-change", {
          bubbles: true,
          composed: true,
          detail: { params: this.#params, routeUid: this.routeUid }
        })
      );
    }

    #dispatchPathnameRequestEvent() {
      if (!this.routeUid) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent<PathnameRequestEventDetails>("r4w-pathname-request", {
          bubbles: true,
          composed: true,
          detail: { routeUid: this.routeUid }
        })
      );
    }

    #handleParamsRequestEvent(evt: CustomEvent<ParamsRequestEventDetails>) {
      const {
        detail: { routeUid }
      } = evt;

      if (this.routeUid !== routeUid) {
        return;
      }

      this.#dispatchParamsChangedEvent();
    }
  };
}

type Constructor<T = HTMLElement & ComponentLifecycle & Pathname & Route> =
  new (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => T;

export interface Params {
  readonly params: Record<string, string> | undefined;
}
