import { compat, types as T } from "../deps.ts";

export const setConfig: T.ExpectedExports.setConfig = async (
  effects,
  newConfig: any,
) => {
  const depsMempool: T.DependsOn =
    newConfig?.["mempool-source"] === "local" ? { mempool: [] } : {};

  return compat.setConfig(effects, newConfig, {
    ...depsMempool,
  });
};
