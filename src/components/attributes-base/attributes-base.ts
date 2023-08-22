/**
 * An abstract class that has boilerplate code to handle observing attribute
 * changes. When an attribute changes a property of a derived class with a name
 * that follows the pattern `"_" + attribute name` will be set with the new
 * attribute value.
 *
 * Classes that derive from AttributesBase will need to override
 * `_observedPatterns` and provide an array of attribute names.
 */
export abstract class AttributesBase extends HTMLElement {
  constructor() {
    super();
  }

  /** Override `_observedPatterns` and provide your class's attribute names. */
  protected static _observedPatterns: string[];

  static get observedAttributes(): string[] {
    return this._observedPatterns;
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    // console.log(
    //   `AttributesBase.attributeChangedCallback: name='${name}', newValue='${newValue}'`
    // );
    this[`_${name}`] = newValue;
  }
}
