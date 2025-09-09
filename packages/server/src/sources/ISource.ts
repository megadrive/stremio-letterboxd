export interface SourceOptions {
  url?: string;
  configString?: string;
}

export interface SourceResult {
  id: string;
  name: string;
  poster?: string;
  /** if the film as an alternate poster, this is the id for it */
  altPoster?: string;
  description?: string;
  cast?: string[];
  director?: string[];
  genres?: string[];
  imdb?: string;
}

export interface ISource<TOptions extends SourceOptions = SourceOptions> {
  fetch(opts: TOptions): Promise<SourceResult[]>;
}

// optional sqlite cache
import keyv from "keyv";
import keyvSqlite from "@keyv/sqlite";

export const createCache = (namespace: string) => {
  return new keyv({
    store: new keyvSqlite({ uri: `sqlite://./.cache/${namespace}.sqlite` }),
    ttl: 1000 * 60 * 60, // 1 hour
  });
};
