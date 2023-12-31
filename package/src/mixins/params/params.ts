import type { R4WDataMap } from "../../types.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import type { Pathname } from "../pathname/pathname.ts";
import type { Route } from "../route/route.ts";
import type { ComponentLifecycle } from "../../libs/component-lifecycle/component-lifecycle.ts";
import type { DisconnectCallback } from "../../libs/events/event.ts";
import { receive, send } from "../../libs/events/event.ts";

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ParamsMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class ParamsImpl extends baseType implements Params {
    #disconnectParamsRequestEvent: DisconnectCallback | undefined;
    #params_params: Params["params_params"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...cArgs: any[]) {
      super(...cArgs);
    }

    get params_params(): Params["params_params"] {
      return this.#params_params;
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
      if (property === "params_params") {
        const oldParams = oldValue as Params["params_params"];
        const newParams = newValue as Params["params_params"];
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

      // console.log(
      //   `Params.update: changedProperties='${changedProperties.join(", ")}'`
      // );

      if (changedProperties.includes("routemx_routeUid")) {
        this.#dispatchPathnameRequestEvent();
      }

      if (
        changedProperties.includes("pathname_pathname") ||
        changedProperties.includes("pathname_pattern") ||
        changedProperties.includes("routemx_routeUid")
      ) {
        if (
          this.pathname_pathname &&
          this.pathname_pattern &&
          this.routemx_routeUid
        ) {
          const { match, params } = getPathnameData(
            this.pathname_pathname,
            this.pathname_pattern
          );
          if (match) {
            this.setState(
              "params_params",
              this.#params_params,
              params,
              next => (this.#params_params = next)
            );
          }
        }
      }

      if (changedProperties.includes("params_params")) {
        this.#dispatchParamsChangedEvent();
      }
    }

    /******************************************************************
     * private
     *****************************************************************/

    #connectListeners() {
      this.#disconnectParamsRequestEvent = receive(
        "r4w-params-request",
        this.#handleParamsRequestEvent.bind(this)
      );
    }

    #disconnectListeners() {
      this.#disconnectParamsRequestEvent &&
        this.#disconnectParamsRequestEvent();
      this.#disconnectParamsRequestEvent = undefined;
    }

    #dispatchParamsChangedEvent() {
      if (!this.routemx_routeUid) {
        return;
      }

      // console.log(
      //   `Params.#dispatchParamsChangedEvent: dispatching; params_params='${
      //     this.#params_params
      //   }', routeUid='${this.routeUid}'`
      // );

      send("r4w-params-change", {
        params: this.#params_params,
        routeUid: this.routemx_routeUid
      });
    }

    #dispatchPathnameRequestEvent() {
      if (!this.routemx_routeUid) {
        return;
      }

      send("r4w-pathname-request", {
        routeUid: this.routemx_routeUid
      });
    }

    #handleParamsRequestEvent({ routeUid }: R4WDataMap["r4w-params-request"]) {
      if (this.routemx_routeUid !== routeUid) {
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
  readonly params_params: Record<string, string> | undefined;
}
