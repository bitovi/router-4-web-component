import type {
  Constructor,
  ParamsChangeEventDetails,
  ParamsRequestEventDetails,
  PathnameRequestEventDetails
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";
import { PathnameMixin } from "../pathname/pathname.ts";

/**
 * This abstract class is used as a base for web components that want to get
 * params information from a route's path. An instance of this class MUST be an
 * element that is the immediate child of `<r4w-route>`. That's because the
 * route is going to set an attribute on this instance whose name is the route's
 * `uid` property.
 *
 * Can be used as a mixin definition.
 * https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ParamsMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class Params extends PathnameMixin(BasecompMixin(baseType)) {
    #handleParamsRequestEventBound:
      | ((evt: CustomEvent<ParamsRequestEventDetails>) => void)
      | undefined;
    #params: Record<string, string> | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /******************************************************************
     * Basecomp
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
        const oldParams = oldValue as typeof this.params;
        const newParams = newValue as typeof this.params;
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

        return true;
      }

      return super.stateComparison(property, oldValue, newValue);
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
              "#params",
              this.#params,
              params,
              next => (this.#params = next)
            );
          }
        }
      }

      if (changedProperties.includes("#params")) {
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
