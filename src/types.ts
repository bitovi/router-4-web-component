/*****************************
  Route types
*****************************/

export interface RouteActivationProps {
  /** This Route's path is being activated. */
  activate: () => void;
  /** This Route's path is being deactivated. */
  deactivate: () => void;
}

export interface RouteMatchProps {
  matchPath: (path: string) => boolean;
}
