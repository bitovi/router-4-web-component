/******************************************************************
 * Link types
 *****************************************************************/
export interface LinkEventDetails {
  /** The `uid` of the router that should handle this event. */
  routerUid: string;
  /** Matches a `path` attribute of a Route to activate. */
  to: string;
}

export interface RouteSelector {
  /**
   * Links a implementor that selects a route to the route's `path` attribute.
   */
  readonly to: string | undefined;
}

/******************************************************************
 * Pathname types
 *****************************************************************/
export interface OnPathnameMatchChange {
  (data: { match: boolean; params?: Record<string, string> }): void;
}

export interface PathnameProps {
  setPathname: (pathname: string) => Promise<void>;
  addMatchChangeListener: (onMatchChange: OnPathnameMatchChange) => void;
}

/******************************************************************
 * Route types
 *****************************************************************/
export interface RouteActivationProps {
  /** This Route's path is being activated. */
  activate: () => void;
  /** This Route's path is being deactivated. */
  deactivate: () => void;
}

export interface RouteMatchProps {
  setPathname: (pathname: string) => Promise<void>;
  /** When the pathname changes the onMatch callbacks are invoked. */
  addMatchListener: (onMatch: (match: boolean) => void) => void;
}

/******************************************************************
 * Router types
 *****************************************************************/
export interface RouterProps {
  /** Each router instance has a unique ID. */
  readonly uid: string;
}