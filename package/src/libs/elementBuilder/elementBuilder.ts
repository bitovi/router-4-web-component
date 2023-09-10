/**
 * Create an element in a single function request.
 */
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: CreateOptions,
  ...args: HTMLElement[]
): HTMLElementTagNameMap[K];
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  ...args: HTMLElement[]
): HTMLElementTagNameMap[K];
export function create(
  tag: string,
  options: CreateOptions,
  ...args: HTMLElement[]
): HTMLElement;
export function create(tag: string, ...args: HTMLElement[]): HTMLElement;
export function create(tag: string, ...args: unknown[]): HTMLElement;
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  ...args: unknown[]
): HTMLElementTagNameMap[K] {
  let children: HTMLElement[] | undefined;
  let options: CreateOptions | undefined;
  if (args.length) {
    if (args[0] instanceof HTMLElement) {
      children = args as HTMLElement[];
    } else {
      options = args[0] as CreateOptions;
      children = args.slice(1) as HTMLElement[];
    }
  }

  const elem = document.createElement(
    tag,
    options?.creationOptions
  ) as HTMLElementTagNameMap[K];

  if (options?.attributes) {
    for (const [key, val] of Object.entries(options.attributes)) {
      elem.setAttribute(key, val);
    }
  }

  if (options?.properties) {
    for (const [key, value] of Object.entries(options?.properties)) {
      (elem as Record<string, unknown>)[key] = value;
    }
  }

  if (options?.listeners) {
    const keys = Object.keys(options.listeners);
    for (const key of keys) {
      const eventName = key as keyof HTMLElementEventMap;
      const handler = options.listeners[eventName];
      if (handler) {
        elem.addEventListener(eventName, handler as (evt: Event) => void);
      }
    }
  }

  if (children) {
    for (const child of children) {
      elem.appendChild(child);
    }
  }

  return elem;
}

interface CreateOptions {
  attributes?: Record<string, string>;
  creationOptions?: ElementCreationOptions;
  listeners?: Partial<{
    [Property in keyof HTMLElementEventMap]: (
      evt: HTMLElementEventMap[Property]
    ) => void;
  }>;
  properties?: Record<string, unknown>;
}
