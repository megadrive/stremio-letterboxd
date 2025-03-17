import { useMemo } from "react";
import { config } from "./config.js";

export const useConfig = (encodedConfig: string) => {
  const memoedEncodedConfig = useMemo(
    () => encodedConfig.replace(/^#/, ""),
    [encodedConfig]
  );
  const conf = useMemo(
    () => config.decode(encodedConfig),
    [memoedEncodedConfig]
  );

  return {
    config: conf,
  };
};
