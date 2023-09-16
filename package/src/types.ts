/******************************************************************
 * Event types
 *****************************************************************/
/**
 * Map event types (names) to the details property of a custom event.
 */
export interface R4WEventMap {
  "r4w-link-event": CustomEvent<LinkEventDetails>;
  "r4w-pathname-change": CustomEvent<PathnameChangeEventDetails>;
  "r4w-route-uid-request": CustomEvent<RouteUidRequestEventDetails>;
  "r4w-switch-uid-request": CustomEvent<SwitchUidRequestEventDetails>;
}

export interface LinkEventDetails {
  /** Matches a `path` attribute of a Route to activate. */
  to: string;
}

export interface PathnameChangeEventDetails {
  pathname: string;
}

export interface RouteUidRequestEventDetails {
  /** Invoked by the Route that contains the element that dispatched this event.
   * Returns the information for the Route and Switch that contain the element.
   * */
  callback: (routeUid: string, routerUid: string) => void;
}

export interface SwitchUidRequestEventDetails {
  /** Invoked by the Switch that contains the element that dispatched this
   * event. Returns the information for the Switch that contain the element.
   * */
  callback: (routerUid: string) => void;
}

/******************************************************************
 * Link types
 *****************************************************************/
export interface RouteSelector {
  /**
   * Links a implementor that selects a route to the route's `path` attribute.
   */
  readonly to: string | undefined;
}

/******************************************************************
 * Mixins
 *****************************************************************/
/**
 * Extend multiple classes using mixins.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = HTMLElement> = new (...args: any[]) => T;

/******************************************************************
 * Pathname types
 *****************************************************************/
export interface OnPathnameMatchChange {
  (data: { match: boolean; params?: Record<string, string> }): void;
}

/******************************************************************
 * Route types
 *****************************************************************/
export interface RouteActivationProps {
  /** This Route's path is being activated. Won't resolve until activation -
   * including downloading a module - has completed. */
  activate: () => Promise<void>;
  /** This Route's path is being deactivated. */
  deactivate: () => void;
}

export interface RouteMatchProps {
  /** When the pathname changes the onMatch callbacks are invoked. */
  addMatchListener: (onMatch: (match: boolean) => void) => void;
  /**
   * Set a pathname value, if the match status of the pathname and pattern
   * changes then the subscribers to onMatchChange will be asynchronously
   * informed.
   */
  setPathname: (pathname: string) => Promise<void>;
}

/******************************************************************
 * UID types
 *****************************************************************/
export interface ElementUidProps {
  /** Each implementing instance has a unique ID. */
  readonly uid: string;
}

/******************************************************************
 * WebComponent types
 *****************************************************************/
export interface WebComponent {
  attributeChangedCallback?: (
    name: string,
    oldValue: string,
    newValue: string
  ) => void;
  connectedCallback?: () => void;
  disconnectedCallback?: () => void;
}
