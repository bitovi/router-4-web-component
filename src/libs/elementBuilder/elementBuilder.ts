export const builder: Readonly<Builder> = Object.freeze<Builder>({
  /**
   * Create an element and configure it.
   */
  create<T extends HTMLElement>(tag: string, ...args: unknown[]) {
    let children: HTMLElement[] | undefined;
    let options: CreateOptions | undefined;
    if (args.length) {
      if (!(args[0] instanceof HTMLElement)) {
        options = args[0] as CreateOptions;
        children = args.slice(1) as HTMLElement[];
      } else {
        children = args as HTMLElement[];
      }
    }

    const elem = document.createElement(tag, options?.creationOptions) as T;

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
});

interface Builder {
  create: <T extends HTMLElement>(
    tag: string,
    options?: CreateOptions,
    ...children: HTMLElement[]
  ) => T;
}

interface CreateOptions {
  creationOptions?: ElementCreationOptions;
  listeners?: Partial<{
    [Property in keyof HTMLElementEventMap]: (
      evt: HTMLElementEventMap[Property]
    ) => any;
  }>;
  properties?: Record<string, unknown>;
}
