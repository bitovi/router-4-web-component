import type {
  // LinkEventDetails,
  RouteMatchProps,
  RouteActivationProps,
  ElementUidProps,
  SwitchUidRequestEventDetails
} from "../../types.ts";
import { create } from "../../libs/elementBuilder/elementBuilder.ts";
import { addEventListenerFactory } from "../../libs/r4w/r4w.ts";
import { BasecompMixin } from "../../libs/basecomp/basecomp.ts";
// import { Redirect } from "../redirect/redirect.ts";

/**
 * Incremented for each Switch instance that's created.
 */
let uidCount = 0;

/**
 * The base element for routing.
 */
export class Switch
  extends BasecompMixin(HTMLElement)
  implements ElementUidProps
{
  #handleSwitchUidRequestEventBound: ((evt: Event) => void) | undefined;
  #uid: string;
  protected _activeRoute: RouteMatchProps | null = null;
  protected _shadowRoot: ShadowRoot;

  constructor() {
    super();

    uidCount = uidCount + 1;
    this.#uid = `r4w-switch-${uidCount}`;

    this._shadowRoot = this.attachShadow({ mode: "closed" });
  }

  static get webComponentName(): string {
    return "r4w-switch";
  }

  get uid(): string {
    return this.#uid;
  }

  override componentConnect(): void {
    super.componentConnect && super.componentConnect();

    this.#handleSwitchUidRequestEventBound =
      this.#handleSwitchUidRequestEvent.bind(this);

    addEventListenerFactory(
      "r4w-switch-uid-request",
      this
    )(this.#handleSwitchUidRequestEventBound);

    // Need to let the DOM finish rendering the children of this switch. Then
    // add the match listeners to the child Routes - these are invoked when the
    // match status changes. After that set the initial selected route.
    const id = requestIdleCallback(() => {
      id && cancelIdleCallback(id);
      const children = (
        this._shadowRoot.childNodes[0] as HTMLSlotElement
      ).assignedElements();

      for (const child of children) {
        if (isRouteLike(child)) {
          child.addMatchListener(match => {
            if (match) {
              this._activeRoute = child;
              // Do not `await` activate, just keep going so all the routes are
              // updated in the same tick.
              child.activate();

              // On initial page load if the path is empty or "/" and a route
              // handles that path the browser will display the page without a
              // navigation event, in such a case we need to set the state
              // associated with the path to this switch's UID.
              !window.history.state &&
                window.history.replaceState(this.uid, "");
            } else {
              this._activeRoute =
                this._activeRoute !== child ? this._activeRoute : null;
              child.deactivate();
            }
          });
        }
      }
    });
  }

  override componentDisconnect(): void {
    super.componentDisconnect && super.componentDisconnect();

    this.#handleSwitchUidRequestEventBound &&
      this.removeEventListener(
        "r4w-switch-uid-request",
        this.#handleSwitchUidRequestEventBound
      );

    this.#handleSwitchUidRequestEventBound = undefined;
  }

  override componentInitialConnect(): void {
    super.componentInitialConnect && super.componentInitialConnect();
    this._shadowRoot.append(create("slot"));
  }

  #handleSwitchUidRequestEvent(evt: Event): void {
    if (!isSwitchUidRequestEventDetails(evt)) {
      return;
    }

    // We don't want upstream switches to get this event so `stopPropagation`.
    evt.stopImmediatePropagation();

    const {
      detail: { callback },
      target
    } = evt;

    // Unfortunately among sibling elements listeners are invoked in the order
    // they are registered, NOT first in the element that is the ancestor of
    // the event dispatcher then the other siblings. So we have to query our
    // children to see if the target is among them, if so we claim the event
    // for this route.
    if (target instanceof HTMLElement) {
      const match = [...this.querySelectorAll(target.localName)].find(
        e => e === target
      );

      if (!match) {
        return;
      }

      callback(this.#uid);
    }
  }

  // async #setPathname(pathname: string) {
  //   const children = (
  //     this._shadowRoot.firstElementChild as HTMLSlotElement
  //   ).assignedElements();

  //   if (!children?.length) {
  //     return;
  //   }

  //   // setPathname only resolves once all the pathname change listeners for that
  //   // route have been invoked with the new pathname. We wait for everything to
  //   // resolve then, if no route is active, and there is a redirect, fire a change
  //   // event with the redirect's `to` value.
  //   await Promise.all(
  //     children
  //       .filter(child => isRouteLike(child))
  //       .map(route =>
  //         (route as unknown as RouteMatchProps).setPathname(pathname)
  //       )
  //   );

  //   if (!this._activeRoute) {
  //     const redirect = children.find(child => isRedirect(child)) as Redirect;

  //     if (redirect?.to) {
  //       this.dispatchEvent(
  //         new CustomEvent<LinkEventDetails>("r4w-link-event", {
  //           bubbles: true,
  //           composed: true,
  //           detail: { to: redirect.to }
  //         })
  //       );
  //     }
  //   }
  // }
}

if (!customElements.get(Switch.webComponentName)) {
  customElements.define(Switch.webComponentName, Switch);
}

// function isRedirect(obj: Element): obj is Redirect {
//   return obj.tagName === Redirect.webComponentName.toLocaleUpperCase();
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRouteLike(obj: any): obj is RouteMatchProps & RouteActivationProps {
  return "addMatchListener" in obj && "activate" in obj && "deactivate" in obj;
}

function isSwitchUidRequestEventDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evt: any
): evt is CustomEvent<SwitchUidRequestEventDetails> {
  return evt && "detail" in evt && "callback" in evt.detail;
}
