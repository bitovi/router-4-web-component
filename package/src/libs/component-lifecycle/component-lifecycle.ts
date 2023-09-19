import type { Constructor } from "../../types.js";

/**
 * Mixin to create a ComponentLifecycleImpl class derived from the HTMLElement
 * class.
 * @description Applied to another web component class this mixin provides a
 * more comprehensive and straightforward way of managing state and events in a
 * web component.
 *
 * Use the `component*` methods to manage the DOM lifecycle. When an event
 * happens use `setState` to update the value of the associated data member,
 * this will trigger a call to update. The `update` method is invoked whenever a
 * data member has changed and is the place to make updates to the DOM, fetch
 * data, etc.
 * @param baseType A class or interface that ComponentLifecycleImpl instance
 * extends.
 * @returns A constructor for ComponentLifecycleImpl.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function ComponentLifecycleMixin<T extends Constructor<any>>(
  baseType: T
) {
  return class ComponentLifecycleImpl
    extends baseType
    implements ComponentLifecycle
  {
    #changedProperties: string[] = [];
    #connected = false;
    #init = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    static defaultStateComparison<T>(oldValue: T, newValue: T): boolean {
      return oldValue === newValue;
    }

    get connected(): boolean {
      return this.#connected;
    }

    get init(): boolean {
      return this.#init;
    }

    /******************************************************************
     * ComponentLifecycle
     *****************************************************************/

    /**
     * Override to make changes when connected. Invoked by `connectedCallback`.
     * @abstract
     * @protected
     */
    componentConnect(): void {
      super.componentConnect && super.componentConnect();
      this.setState(
        "connected",
        this.#connected,
        true,
        next => (this.#connected = next)
      );
    }

    componentDisconnect(): void {
      super.componentDisconnect && super.componentDisconnect();
      this.setState(
        "connected",
        this.#connected,
        false,
        next => (this.#connected = next)
      );
    }

    /**
     * Override to make changes only the very first time the component is
     * connected.
     * @abstract
     * @protected
     */
    componentInitialConnect(): void {
      super.componentInitialConnect && super.componentInitialConnect();
      // this.setState("init", this.#init, true, next => (this.#init = next));
    }

    /**
     * Invoked by `setState` to determine if state has changed; defaults to a
     * `===` comparison. Override to provide a custom comparison.
     * @param property The name of the property being compared.
     * @param oldValue The current value of the property.
     * @param newValue The new value of the property.
     * @returns If false (old and new values are not the same) the property will
     * be set with `newValue` and an update cycle will start.
     * @protected
     */
    stateComparison<T>(property: string, oldValue: T, newValue: T): boolean {
      if (super.stateComparison) {
        return super.stateComparison(property, oldValue, newValue);
      }

      return ComponentLifecycleImpl.defaultStateComparison(oldValue, newValue);
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

      // console.log(
      //   `ComponentLifecycleImpl.setState: property='${property}', current='${current}', next='${next}'; updating.`
      // );

      setter(next, property);

      this.#changePropertiesAndQueueUpdate(property);
    }

    /**
     * Invoked when state is changed. This is the time to make changes to the DOM.
     * @protected
     */
    update(changedProperties: string[]): void {
      super.update && super.update(changedProperties);
    }

    /******************************************************************
     * private
     *****************************************************************/

    /**
     * Do NOT override!, Prefer override of `componentInitialConnect` or
     * `componentConnect`.
     * @private
     */
    connectedCallback() {
      if (this.#connected) {
        return;
      }

      this.#connected = true;
      this.#changePropertiesAndQueueUpdate("connected");

      if (!this.#init) {
        this.#init = true;
        this.#changePropertiesAndQueueUpdate("init");
        this.componentInitialConnect();
      }

      this.componentConnect();

      this.#queueUpdate();
    }

    /**
     * @private
     */
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      this.#connected = false;
      this.#changePropertiesAndQueueUpdate("connected");
    }

    #changePropertiesAndQueueUpdate(property: string): void {
      if (!this.#changedProperties.includes(property)) {
        this.#changedProperties.push(property);
      }

      this.#queueUpdate();
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

/**
 * An interface that defines methods needed by an object to manage the web
 * component lifecycle.
 */
export interface ComponentLifecycle {
  /*
   * Invoked whenever the component is attached to the DOM. This can be invoked
   * multiple times. Typically event listeners are connected here.
   */
  componentConnect?(): void;
  /**
   * Invoked when the component is removed from the DOM. This is where event
   * listeners should be disconnected.
   */
  componentDisconnect?(): void;
  /**
   * Invoked only one time when the element is initially attached to the DOM.
   * This is a good place to construct the elements initial DOM children.
   */
  componentInitialConnect?(): void;
  /**
   * Compares two values (shallow comparison using `===`) and returns a value
   * the indicates if the values are the same (false when the values are
   * different, true when they are the same).
   * @param property The name of the property that holds the value. If the
   * property is accessible through a public getter or data member use the
   * public name.
   * @param oldValue Usually the current property value.
   * @param newValue The value to set on the property, if it is the same as the
   * oldValue nothing will happen.
   * @returns False indicates the values ae not the same, true that they are the
   * same.
   */
  stateComparison?<T>(property: string, oldValue: T, newValue: T): boolean;
  /**
   * Change the value of a class data property.
   * @param property The name of the property that holds the value. If the
   * property is accessible through a public getter or data member use the
   * public name.
   * @param current The current property value.
   * @param next The value to set on the property, if it is the same as
   * `current` nothing will happen.
   * @param setter
   */
  setState<T>(
    property: string,
    current: T,
    next: T,
    /**
     * Invoked when `current` and `next` are different to update a property with
     * the value of `next`.
     */
    setter: (
      /** The value to set on the property. */ value: T,
      /** The name of the property to change. */ property?: string
    ) => void
  ): void;
  /**
   * After properties have been set the `update` method will run. This is where
   * the web component should update the DOM or start any side effects.
   * @param hangedProperties A collection of the names of the properties that
   * have changed during this update cycle.
   */
  update(hangedProperties: string[]): void;
}
