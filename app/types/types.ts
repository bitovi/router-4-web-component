/**
 * Extend multiple classes using mixins.
 */
export type Constructor<T = HTMLElement> = new (...args: any[]) => T;

export interface RestaurantData {
  [region: string]: {
    [city: string]: RestaurantItem[];
  };
}

export interface RestaurantItem {
  address: {
    city: string;
    state: string;
    street: string;
    zip: string;
  };
  resources: {
    banner: string;
    owner: string;
    thumbnail: string;
  };
  name: string;
  slug: string;
}
