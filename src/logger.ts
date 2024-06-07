import debug from "debug";
export const logger = (namespace: string) => debug(`letterboxd:${namespace}`);
