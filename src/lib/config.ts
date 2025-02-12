type Config = {
  /** Path to the resource. */
  path: string;
  /** Path with dashes for everything non-alpha. */
  pathSafe: string;
  /** The name of the resource. */
  name?: string;
  /** Type of the resource. */
  type: "unset" | "watchlist" | "list" | "person";
  reserved?: boolean;
  /** Replace posters with the user provided choice. */
  posterChoice:
    | "cinemeta"
    | "letterboxd"
    | "letterboxd-ratings"
    | "letterboxd-custom-from-list"
    | "rpdb";
  /** RPDB API key. */
  rpdbApiKey?: string;
  /** A user's list identifier. */
  listId?: string;
  /** A user's username. */
  username?: string;
  /** Best guess at a catalog name. */
  catalogName: string;
  /** Whether to ignore unreleased films. */
  ignoreUnreleased: boolean;
};

const defaultConfig: Config = {
  path: "/",
  pathSafe: "-",
  type: "unset",
  posterChoice: "cinemeta",
  catalogName: "Unnamed Catalog",
  ignoreUnreleased: false,
};

/**
 * Parse an old config string.
 * @deprecated
 */
const parseOldConfig = (str: string): Config => {
  console.info("parsing old config");
  const decoded = decodeURIComponent(str);
  const split = decoded.split(/\|/g); // "almosteffective|maybe" -> ["almosteffective", "maybe"]
  const [username, listId] = split;

  let type: Config["type"] = "unset";
  let path = "";
  if (split[1]) {
    path = `/${username}/list/${listId}/`;
    type = "list";
  } else {
    path = `/${username}/watchlist/`;
    type = "watchlist";
  }

  let catalogName = "";
  if (listId) {
    catalogName = `${listId} ${type} - ${username}`;
  } else {
    catalogName = `${type} - ${username}`;
  }

  return {
    path,
    pathSafe: path.replace(/[^A-Za-z0-9]/g, "-"),
    posterChoice: "cinemeta",
    type,
    listId,
    name: listId ? listId.replace(/[^A-Za-z]/g, " ") : "watchlist",
    username,
    catalogName,
    ignoreUnreleased: false,
  };
};

/**
 * Parses an encoded URL config to a Config object
 * @param str Encoded URL Config string, which will be (encoded) like this: "/path/to/thing|a|b|c|d"
 * @returns Config object
 */
export const parseConfig = (str: string): Config => {
  // remove leading https://letterboxd.com if present
  const convertedConfigString = str
    .trim()
    .replace(/^https:\/\/(www\.)?letterboxd\.com/, "");

  /**
   * Expected input: %2Ffcbarcelona%2Flist%2Fmovies-everyone-should-watch-at-least-once%2F%2Cp
   * p = posters
   */
  const decoded = decodeURIComponent(convertedConfigString);
  const split = decoded.split(/\|/g);
  const [path, ...providedOpts] = split;
  const opts: {
    posterChoice: Config["posterChoice"];
    rpdbApiKey?: Config["rpdbApiKey"];
    catalogName?: Config["catalogName"];
    ignoreUnreleased?: Config["ignoreUnreleased"];
  } = { posterChoice: "cinemeta" };
  if (providedOpts) {
    for (const o of providedOpts) {
      const opt = decodeURIComponent(o);
      // parse as a string
      const [k, v] = o.split("=");
      if (k === "cn") {
        opts.catalogName = v;
      }
      if (k === "p") {
        switch (v) {
          case "cinemeta":
          case "letterboxd":
          case "letterboxd-ratings":
          case "letterboxd-custom-from-list":
          case "rpdb":
            opts.posterChoice = v;
            break;
          default:
            opts.posterChoice = "cinemeta";
        }
      }
      if (opts.posterChoice === "rpdb" && k === "rpdb") {
        opts.rpdbApiKey = v;
      }
    }
  }

  if (!path.startsWith("/")) {
    return parseOldConfig(str);
  }

  const reserved = {
    first: [
      "films",
      "film",
      "actor",
      "director",
      "producer",
      "writer",
      "casting",
      "editor",
      "cinematography",
      "assistant-directing",
      "additional-directing",
      "executive-producer",
      "lighting",
      "camera-operator",
      "production-design",
      "art-direction",
      "set-decoration",
      "special-effects",
      "visual-effects",
      "stunts",
      "composer",
      "sound",
      "costume-design",
      "makeup",
      "hairstyling",
    ],
    second: ["list", "watchlist"],
  };

  const pathSplit = path.replace(/\/\/+/g, "/").split(/\//g);
  /** first: username or reserved word, second: list,  watchlist or actors name, third: list-id */
  const [_, usernameOrReserved, typeOrPerson, listId] = pathSplit;

  const username = (() => {
    if (!reserved.first.includes(usernameOrReserved.toLowerCase())) {
      return usernameOrReserved;
    }

    return undefined;
  })();

  let isReservedType = false;

  // Get the Type of link
  const type = ((): Config["type"] => {
    // replace duplicate slashes, then split
    // if "/list or /watchlist", it's a list.
    if (typeOrPerson && reserved.second.includes(typeOrPerson.toLowerCase())) {
      switch (typeOrPerson.toLowerCase()) {
        case "watchlist":
          return "watchlist";
        case "list":
          return "list";
        default:
          return "unset";
      }
    }

    if (
      usernameOrReserved &&
      reserved.first.includes(usernameOrReserved.toLowerCase())
    ) {
      isReservedType = true;
      // TODO: Typescript error here, might need to hoist the reserved up and use an `as const`.
      // @ts-ignore
      return usernameOrReserved;
    }

    return "unset";
  })();

  const name = ((): Config["name"] => {
    // Reserved, it's a person
    switch (type) {
      case "person":
        return typeOrPerson;
      case "list":
        return listId;
      case "watchlist":
      case "unset":
        return undefined;
    }
  })();

  let catalogName = opts.catalogName ?? "";
  console.log(catalogName);
  if (!catalogName) {
    if (isReservedType) {
      // shenanigans
      // /films/decade/2020s/genre/adventure/by/releases
      // k/v pairs after films
      const [, , ...urlOpts] = pathSplit;
      const opts: Record<string, string> = {};
      let i = 1;
      while (i < urlOpts.length) {
        if (!urlOpts[i + 1]) break; // if no second option, break out of the loop
        opts[urlOpts[i]] = urlOpts[i + 1].replace(/\-/g, " ");
        i += 2;
      }

      /*
    {
      'this': 'week'|'month'
      'decade': '2020s',
      'by': 'release',
      'genre': 'adventure',
      'on': 'amazon-us',
    }
    preferred is decade -> genre -> sort/by -> on
    */
      const catalog: string[] = [];
      if (opts.this) {
        catalog.push(`Popular this ${opts.this}`);
      }
      if (opts.decade) {
        catalog.push(opts.decade);
      }
      if (opts.genre) {
        catalog.push(opts.genre);
      }
      catalog.push("films");
      if (opts.by) {
        catalog.push("sorted by");
        catalog.push(opts.by);
      }
      if (opts.on) {
        catalog.push("on");
        catalog.push(opts.on);
      }

      catalogName = catalog
        .map((l) => l[0].toUpperCase() + l.slice(1))
        .join(" ");
    }
    if (type === "list") {
      catalogName = `${listId} ${username}`;
    }
    if (type === "watchlist") {
      catalogName = `watchlist ${username}`;
    }
  }

  console.info(
    `Got config: ${path} (${type}) with ${
      Object.keys(opts).length
    } options from ${str}`
  );

  const resolvedConfig: Config = {
    ...defaultConfig,
    path,
    pathSafe: path.replace(/[^A-Za-z0-9]/g, "-"),
    type,
    listId,
    name,
    posterChoice: opts.posterChoice,
    rpdbApiKey: opts.rpdbApiKey,
    username,
    catalogName,
    ignoreUnreleased: opts.ignoreUnreleased ?? false,
  };

  return resolvedConfig;
};
