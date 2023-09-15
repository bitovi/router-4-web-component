import type { Constructor } from "../../types.ts";

/**
 * Mixin to create a Basecomp constructor for a specific type.
 * @param baseType A class or interface that Basecomp instance extends.
 * @returns A constructor for Basecomp.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Basecomp<T extends Constructor>(baseType: T) {
  /**
   * A base class to manage the lifecycle and updating of a web component.
   */
  return class Basecomp extends baseType {
    #changedProperties: string[] = [];
    #connected = false;
    #init = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Override to make changes when connected. Invoked by `connectedCallback`.
     * @abstract
     * @protected
     */
    componentConnect(): void {
      // No default implementation.
    }

    /**
     * Override to make changes only the very first time the component is
     * connected.
     * @abstract
     * @protected
     */
    componentInitialConnect(): void {
      // No default implementation.
    }

    /**
     * Invoked by `setState` to determine if state has changed; defaults to a
     * `===` comparison. Override to provide a custom comparison.
     * @param property The name of the property being compared.
     * @param oldValue The current value of the property.
     * @param newValue The new value of the property.
     * @returns If true the property will be set with `newValue` and an update
     * cycle will start.
     * @protected
     */
    stateComparison<T>(property: string, oldValue: T, newValue: T): boolean {
      return oldValue === newValue;
    }

    /**
     * Set a class's property and queue up an update request is necessary.
     * @param property The name of the property.
     * @param current The current property value.
     * @param next The value to set.
     * @param setter A callback to set a property.
     * @protected
     */
    setState<T>(
      property: string,
      current: T,
      next: T,
      setter: (value: T, property?: string) => void
    ): void {
      if (this.stateComparison(property, current, next)) {
        return;
      }

      setter(next, property);

      if (!this.#changedProperties.includes(property)) {
        this.#changedProperties.push(property);
      }

      this.#queueUpdate();
    }

    /**
     * Invoked when state is changed. This is the time to make changes to the DOM.
     * @protected
     */
    update(changedProperties: string[]): void {
      // No default implementation.
    }

    /**
     * Do NOT override!, Prefer override of `componentInitialConnect` or
     * `componentConnect`.
     * @private
     */
    connectedCallback() {
      // If you need to specifically invoke a Mixin's functions - and it seems
      // like you should - you will need to tell TS that you know what you are
      // doing and ignore the error.
      //
      // @ts-ignore
      super.connectedCallback && super.connectedCallback();

      if (this.#connected) {
        return;
      }

      this.#connected = true;

      if (!this.#init) {
        this.#init = true;
        this.componentInitialConnect();
      }

      this.componentConnect();

      this.#queueUpdate();
    }

    /**
     * @private
     */
    disconnectedCallback() {
      // @ts-ignore
      super.disconnectedCallback && super.disconnectedCallback();

      this.#connected = false;
    }

    #queueUpdate() {
      if (!this.#changedProperties.length) {
        return;
      }

      window.queueMicrotask(() => {
        // While this callback is executing more state changes might occur, so
        // keep iterating until state settles. Yup, you could create an infinite
        // loop here.
        while (this.#changedProperties.length) {
          const changed = [...this.#changedProperties];
          this.#changedProperties.length = 0;
          this.update(changed);
        }
      });
    }
  };
}
