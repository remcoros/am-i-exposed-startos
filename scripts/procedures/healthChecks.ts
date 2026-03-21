import { types as T, checkWebUrl, catchError } from "../deps.ts";

export const health: T.ExpectedExports.health = {
  async "web-ui"(effects, duration) {
    return checkWebUrl("http://am-i-exposed.embassy:8080/health")(
      effects,
      duration,
    ).catch(catchError(effects));
  },
};
