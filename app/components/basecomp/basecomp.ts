/**
 * Mixin to create a Basecomp constructor for a specific type.
 * @param baseType A class or interface that Basecomp instance extends.
 * @returns A constructor for Basecomp.
 */
export function Basecomp<T extends Constructor>(baseType: T) {
  /**
   * A base class to manage the lifecycle and updating of a web component.
   */
  return class Basecomp extends baseType {
    #connected = false;
    #stateChanged = false;

    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Override to make changes when connected. Invoked by `connectedCallback`.
     * @abstract
     * @protected
     */
    componentConnected(): void {}

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

      this.#stateChanged = true;

      this.#queueUpdate();
    }

    /**
     * Invoked when state is changed. This is the time to make changes to the DOM.
     * @protected
     */
    update(): void {}

    /**
     * Do NOT override!, Prefer override of `componentConnected`.
     * @private
     * @returns
     */
    connectedCallback() {
      if (this.#connected) {
        return;
      }

      this.#connected = true;

      this.componentConnected();

      this.#queueUpdate();
    }

    #queueUpdate() {
      if (!this.#stateChanged) {
        return;
      }

      window.queueMicrotask(() => {
        if (!this.#stateChanged) {
          return;
        }

        this.update();

        this.#stateChanged = false;
      });
    }
  };
}

type Constructor<T = HTMLElement> = new (...args: any[]) => T;