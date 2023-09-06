import type { R4WEventMap } from "../../types.ts";
import { Router } from "../../components/router/router.ts";
import { Route } from "../../components/route/route.ts";

/**
 * A type-safe way to set an event listener for r4w custom events.
 * @param type The type (name) of the the event.
 * @param element Object that has an `addEventListener` function; defaults to
 * `window`.
 * @returns A function that allows a listener function to be set.
 */
export function addEventListenerFactory<K extends keyof R4WEventMap>(
  type: K,
  element: Window | Element = window
) {
  const addR4WEventListener = element.addEventListener as <
    K extends keyof R4WEventMap
  >(
    type: K,
    listener: (this: Window, ev: R4WEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => void;

  return (
    listener: (this: Window, ev: R4WEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) => {
    return addR4WEventListener(type, listener, options);
  };
}

export function findParentRoute(
  parentElement: HTMLElement | null
): Route | null {
  let parent = parentElement;

  while (parent && !(parent instanceof Route)) {
    parent = parent.parentElement;
  }

  return parent;
}

export function findParentRouter(
  parentElement: HTMLElement | null
): Router | null {
  let parent = parentElement;

  while (parent && !(parent instanceof Router)) {
    parent = parent.parentElement;
  }

  return parent;
}
