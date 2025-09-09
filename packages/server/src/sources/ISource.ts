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
