// optional sqlite cache
import keyv from "keyv";
import keyvSqlite from "@keyv/sqlite";

export const createCache = <T>(namespace: string, ttl = 1000 * 60 * 60) => {
  return new keyv<T>({
    store: new keyvSqlite({ uri: `sqlite://./.cache/${namespace}.sqlite` }),
    ttl,
  });
};
