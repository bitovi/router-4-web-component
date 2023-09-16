import type { R4WEventMap } from "../../types.ts";

/**
 * A type-safe way to set an event listener for r4w custom events.
 * @param type The type (name) of the the event.
 * @param element Object that has an `addEventListener` function; defaults to
 * `window`.
 * @returns A function that allows a listener function to be set.
 */
export function addEventListenerFactory<K extends keyof R4WEventMap>(
  type: K,
  element: Document | Element | Window
): Listener<K> {
  const addR4WEventListener = element.addEventListener as <
    K extends keyof R4WEventMap
  >(
    type: K,
    listener: (this: Window, ev: R4WEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) => void;

  return (listener, options) => {
    return addR4WEventListener(type, listener, options);
  };
}

interface Listener<K extends keyof R4WEventMap> {
  (
    listener: (this: Window, ev: R4WEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}
