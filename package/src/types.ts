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
  /**
   * Subscribers will be informed when there has been a change in the matching
   * of a pathname to a pattern.
   */
  addMatchChangeListener: (onMatchChange: OnPathnameMatchChange) => void;
  setPathname: RouteMatchProps["setPathname"];
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
 * Router types
 *****************************************************************/
export interface RouterProps {
  /** Each router instance has a unique ID. */
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
