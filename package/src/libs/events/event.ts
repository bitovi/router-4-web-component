import type {
  EventDetails,
  R4WDataMap,
  R4WDetailMap,
  R4WInternalDetailMap
} from "../../types";

/**
 * Provide a callback to receive notifications when events happen.
 * @param name Name of the event.
 * @param callback Invoked when an event arrives.
 * @param target The EventTarget that is the target of the event; defaults to
 * `window`.
 * @returns A function that should be invoked to disconnect the callback.
 */
export function receive<T extends keyof R4WDetailMap>(
  name: T,
  callback: ReceiveCallback<T>,
  target?: EventTarget
): DisconnectCallback {
  return receiveInternal(name, callback, target);
}

/**
 * Provide a callback to receive notifications when events happen.
 * @private
 * @param name Name of the event.
 * @param callback Invoked when an event arrives.
 * @param target The EventTarget that is the target of the event; defaults to
 * `window`.
 * @returns A function that should be invoked to disconnect the callback.
 */
export function receiveInternal<T extends keyof R4WDataMap>(
  name: T,
  callback: ReceiveCallback<T>,
  target: EventTarget = window
): DisconnectCallback {
  function listener(evt: Event): void {
    const cEvt = evt as CustomEvent<R4WInternalDetailMap[T]>;

    const data: EventDetails = {
      ...cEvt.detail,
      handled: options => {
        options?.stopDefaultAction && evt.preventDefault();
        options?.stopProcessing && evt.stopImmediatePropagation();
        options?.stopPropagation && evt.stopPropagation();
      },
      source: evt.target instanceof HTMLElement ? evt.target : null
    };

    callback(data as R4WDataMap[T]);
  }

  target.addEventListener(name, listener);

  return () => {
    target.removeEventListener(name, listener);
  };
}

/**
 * Dispatches an event that is able to bubble up out of the shadow DOM.
 * @param name Name of the event.
 * @param data Data associated with the event.
 * @param target The EventTarget that is the target of the event; defaults to
 * `window`.
 */
export function send<T extends keyof R4WDetailMap>(
  name: T,
  data: R4WDetailMap[T],
  target?: EventTarget
): void {
  return sendInternal(name, data as R4WInternalDetailMap[T], target);
}

/**
 * Dispatches an event that is able to bubble up out of the shadow DOM.
 * @private
 * @param name Name of the event.
 * @param data Data associated with the event.
 * @param target The EventTarget that is the target of the event; defaults to
 * `window`.
 */
export function sendInternal<T extends keyof R4WInternalDetailMap>(
  name: T,
  data: R4WInternalDetailMap[T],
  target: EventTarget = window
): void {
  target.dispatchEvent(
    new CustomEvent(name, { bubbles: true, composed: true, detail: data })
  );
}

/**
 * Release a callback.
 */
export interface DisconnectCallback {
  (): void;
}

/**
 * Callback invoked when data arrives.
 */
export interface ReceiveCallback<T extends keyof R4WDataMap> {
  (/** Data with information from the event. */ data: R4WDataMap[T]): void;
}
