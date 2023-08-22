import { splitPath } from "../../libs/path/path.ts";
import { AttributesBase } from "../attributes-base/attributes-base.ts";

export class Params extends AttributesBase {
  _pattern: string;

  constructor() {
    super();
  }

  protected static _observedPatterns = ["pattern"];

  static get webComponentName() {
    return "r4w-params";
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === "pattern") {
      console.log(
        "Params.attributeChangedCallback: params=",
        getParams(this._pattern)
      );
    }
  }
}

if (!customElements.get(Params.webComponentName)) {
  customElements.define(Params.webComponentName, Params);
}

interface ParamsProps {
  readonly params: Record<string, string>;
}

function getParams(pattern: string): Record<string, string> | undefined {
  if (pattern.indexOf(":") < 0) {
    return;
  }

  const pathnameData = splitPath(window.location.pathname);
  const patternData = splitPath(pattern);

  if (pathnameData.parts.length !== patternData.parts.length) {
    return;
  }

  if (pathnameData.absolute !== patternData.absolute) {
    return;
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternData.parts.length; i++) {
    let matched = false;

    const pathnameDecoded = decodeURIComponent(pathnameData.parts[i]);
    const patternDecoded = decodeURIComponent(patternData.parts[i]);

    if (patternDecoded.startsWith(":")) {
      params[patternDecoded.slice(1)] = pathnameDecoded;
      matched = true;
    } else {
      matched = pathnameDecoded === patternDecoded;
    }

    if (!matched) {
      return;
    }
  }

  return params;
}
