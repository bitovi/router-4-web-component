import type { Constructor, PathnameChangeEventDetails } from "../../types.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";
import { getPathnameData } from "../../libs/url/url.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

/**
 * This abstract class is used as a base for web components that want to be
 * informed of pathname changes.
 *
 * Can be used as a mixin definition.
 * https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PathnameChangedMixin<T extends Constructor>(baseType: T) {
  return class PathnameChanged extends BasecompMixin(baseType) {
    #handlePathnameChangeBound: ((evt: Event) => void) | undefined;
    #pathname: string | undefined;
    #pattern: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get pattern(): string | undefined {
      return this.#pattern;
    }

    set pattern(pattern: string | undefined) {
      this.setState(
        "pattern",
        this.#pattern,
        pattern,
        next => (this.#pattern = next)
      );
    }

    /******************************************************************
     * Basecomp
     *****************************************************************/
    override componentConnect(): void {
      super.componentConnect && super.componentConnect();

      this.#handlePathnameChangeBound = this.#handlePathnameChange.bind(this);

      addEventListenerFactory(
        "r4w-pathname-change",
        window
      )(this.#handlePathnameChangeBound);
    }

    override componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();

      this.#handlePathnameChangeBound &&
        window.removeEventListener(
          "r4w-pathname-change",
          this.#handlePathnameChangeBound
        );

      this.#handlePathnameChangeBound = undefined;
    }

    override update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);
    }

    /**
     * Invoked when the browser's pathname has changed.
     * @abstract
     * @protected
     */
    onPathnameChange(pathname: string, match: boolean): void {
      super.onPathnameChange && super.onPathnameChange(pathname, match);
    }

    // async #getRouteUids() {
    //   return new Promise<void>(resolve => {
    //     this.dispatchEvent(
    //       new CustomEvent<SwitchUidRequestEventDetails>(
    //         "r4w-router-uid-request",
    //         {
    //           bubbles: true,
    //           composed: true,
    //           detail: {
    //             callback: routerUid => {
    //               this.#routerUid = routerUid;
    //             }
    //           }
    //         }
    //       )
    //     );

    //     resolve();
    //   });
    // }

    #handlePathnameChange(evt: Event) {
      if (!isPathnameChangeEventDetails(evt)) {
        return;
      }

      const {
        detail: { pathname }
      } = evt;

      if (this.#pathname === pathname) {
        return;
      }

      this.#pathname = pathname;

      const { match } = getPathnameData(pathname, this.pattern);

      this.onPathnameChange(pathname, match);
    }
  };
}

function isPathnameChangeEventDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt: any
): evt is CustomEvent<PathnameChangeEventDetails> {
  return evt && "detail" in evt && "pathname" in evt.detail;
}
