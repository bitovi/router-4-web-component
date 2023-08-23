export const builder: Readonly<Builder> = Object.freeze<Builder>({
  /**
   * Create an element and configure it.
   */
  create<T extends HTMLElement>(tag: string, ...args: unknown[]) {
    let children: HTMLElement[] | undefined;
    let options: CreateOptions | undefined;
    if (args.length) {
      if (!(args[0] instanceof HTMLElement)) {
        options = args[0];
        children = args.slice(1) as HTMLElement[];
      } else {
        children = args as HTMLElement[];
      }
    }

    const elem = document.createElement(tag, options?.creationOptions) as T;

    if (options?.properties) {
      for (const [key, value] of Object.entries(options?.properties)) {
        elem[key] = value;
      }
    }

    if (options?.listeners) {
      for (const [key, value] of Object.entries(options?.listeners)) {
        elem.addEventListener(key, value);
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
  listeners?: Partial<Record<keyof HTMLElementEventMap, EventListener>>;
  properties?: Record<string, unknown>;
}
