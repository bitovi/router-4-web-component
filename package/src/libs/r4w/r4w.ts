import { Route } from "../../components/route/route.ts";
import { Router } from "../../components/router/router.ts";

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
