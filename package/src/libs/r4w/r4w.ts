import { Router } from "../../components/router/router.ts";

export function findParentRouter(
  parentElement: HTMLElement | null
): Router | null {
  let parent = parentElement;

  while (parent && !(parent instanceof Router)) {
    parent = parent.parentElement;
  }

  return parent;
}
