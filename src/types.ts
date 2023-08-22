/******************************************************************
 * Link types
 *****************************************************************/
export interface LinkEventDetails {
  /** The `uid` of the router that should handle this event. */
  routerUid: string;
  /** Matches a `path` attribute of a Route to activate. */
  to: string;
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
  /** Returns true if the provided path is handled by the implementor. */
  matchPath: (path: string) => boolean;
}

/******************************************************************
 * Router types
 *****************************************************************/
export interface RouterProps {
  /** Each router instance has a unique ID. */
  readonly uid: string;
}

export interface RouteSelector {
  /**
   * Links a implementor that selects a route to the route's `path` attribute.
   */
  readonly to: string;
}
