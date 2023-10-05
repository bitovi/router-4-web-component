import type { R4WDataMap } from "../../types.ts";
import type { ComponentLifecycle } from "../../libs/component-lifecycle/component-lifecycle.ts";
import type { Route } from "../route/route.ts";
import type { DisconnectCallback } from "../../libs/events/event.ts";
import { receive } from "../../libs/events/event.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PathnameMixin<T extends Constructor>(baseType: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return class PathnameImpl extends baseType implements Pathname {
    #disconnectPathnameChangeEvent: DisconnectCallback | undefined;
    #pathname_pathname: Pathname["pathname_pathname"];
    #pathname_pattern: Pathname["pathname_pattern"];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    get pathname_pathname(): Pathname["pathname_pathname"] {
      return this.#pathname_pathname;
    }

    get pathname_pattern(): Pathname["pathname_pattern"] {
      return this.#pathname_pattern;
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
      this.#disconnectPathnameChangeEvent = receive(
        "r4w-pathname-change",
        this.#handlePathnameChangeEvent.bind(this)
      );
    }

    #disconnectListeners() {
      this.#disconnectPathnameChangeEvent &&
        this.#disconnectPathnameChangeEvent();
      this.#disconnectPathnameChangeEvent = undefined;
    }

    #handlePathnameChangeEvent({
      pathname,
      pattern,
      routeUid
    }: R4WDataMap["r4w-pathname-change"]) {
      if (this.routemx_routeUid !== routeUid) {
        return;
      }

      this.setState(
        "pathname_pathname",
        this.#pathname_pathname,
        pathname,
        next => (this.#pathname_pathname = next)
      );

      this.setState(
        "pathname_pattern",
        this.#pathname_pattern,
        pattern,
        next => (this.#pathname_pattern = next)
      );
    }
  };
}

type Constructor<T = HTMLElement & ComponentLifecycle & Route> = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export interface Pathname {
  readonly pathname_pathname: string | undefined;
  readonly pathname_pattern: string | undefined;
}
