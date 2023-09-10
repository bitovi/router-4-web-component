import type {
  PathnameChangeEventDetails,
  RouterUidRequestEventDetails,
  WebComponent
} from "../../types.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";

/**
 * This abstract class is used as a base for web components that want to be
 * informed of pathname changes.
 */
export class PathnameChanged extends HTMLElement implements WebComponent {
  #connected = false;
  #handlePathnameChangeBound: ((evt: Event) => void) | undefined;
  #routerUid: string | undefined;

  constructor() {
    super();

    this.#getRouteUids();
  }

  connectedCallback() {
    if (this.#connected) {
      return;
    }

    this.#connected = true;

    this.#handlePathnameChangeBound = this.#handlePathnameChange.bind(this);

    addEventListenerFactory(
      "r4w-pathname-change",
      window
    )(this.#handlePathnameChangeBound);
  }

  disconnectedCallback() {
    this.#handlePathnameChangeBound &&
      window.removeEventListener(
        "r4w-pathname-change",
        this.#handlePathnameChangeBound
      );

    this.#handlePathnameChangeBound = undefined;
  }

  /**
   * Invoked when the browser's pathname has changed.
   * @abstract
   * @protected
   */
  onPathnameChange(pathname: string): void {
    throw Error(
      "Not implemented! Please override `onPathnameChange` and provide an implementation."
    );
  }

  async #getRouteUids() {
    return new Promise<void>(resolve => {
      this.dispatchEvent(
        new CustomEvent<RouterUidRequestEventDetails>(
          "r4w-router-uid-request",
          {
            bubbles: true,
            composed: true,
            detail: {
              callback: routerUid => {
                this.#routerUid = routerUid;
              }
            }
          }
        )
      );

      resolve();
    });
  }

  #handlePathnameChange(evt: Event) {
    if (!isPathnameChangeEventDetails(evt)) {
      return;
    }

    const {
      detail: { pathname, routerUid }
    } = evt;

    if (this.#routerUid === routerUid) {
      this.onPathnameChange(pathname);
    }
  }
}

function isPathnameChangeEventDetails(
  obj: any
): obj is CustomEvent<PathnameChangeEventDetails> {
  return (
    obj &&
    "detail" in obj &&
    "pathname" in obj.detail &&
    "routerUid" in obj.detail
  );
}
