/*****************************
  Route types
*****************************/

export interface RouteActivation {
  /** This Route's path is being activated. */
  activate: () => void;
  /** This Route's path is being deactivated. */
  deactivate: () => void;
}

export interface RouteMatch {
  matchPath: (path: string) => boolean;
}
