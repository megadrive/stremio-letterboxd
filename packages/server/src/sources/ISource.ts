import { type Config } from "@stremio-addon/config";

export interface SourceOptions {
  url?: string;
  config?: Config;
  configString?: string;
  skip?: number;
  sort?: string;
}

export interface SourceResult {
  id: string;
  name: string;
  poster?: string;
  type?: "movie" | "series";
  /** if the film as an alternate poster, this is the id for it */
  altPoster?: string;
  description?: string;
  cast?: string[];
  director?: string[];
  genres?: string[];
  imdb?: string;
  tmdb: string;
}

export type FetchReturn = Promise<{
  shouldStop?: boolean;
  metas: SourceResult[];
}>;

export interface ISource<TOptions extends SourceOptions = SourceOptions> {
  /**
   * A fetch function that retrieves metadata from the source.
   * It should return an object containing a `shouldStop` boolean and an array of `SourceResult` objects.
   * If `shouldStop` is true, the fetching process should stop immediately.
   * Usually used if the Source fetch was successful and no data was returned
   * For instance, all items have been fetched.
   *
   * @param opts - Options for fetching data, including URL, config string, and pagination skip value.
   */
  fetch(opts: TOptions): FetchReturn;
}
