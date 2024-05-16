type Config = {
  /** Path to the resource. */
  path: string;
  /** Path with dashes for everything non-alpha. */
  pathSafe: string;
  /** The name of the resource. */
  name?: string;
  /** Type of the resource. */
  type: "unset" | "watchlist" | "list" | "person";
  /** Replace posters with Letterboxd ones. */
  posters: boolean;
  /** A user's list identifier. */
  listId?: string;
  /** @deprecated */
  username?: string;
};

const defaultConfig: Config = {
  path: "/",
  pathSafe: "-",
  type: "unset",
  posters: false,
};

/**
 * Parse an old config string.
 * @deprecated
 */
const parseOldConfig = (str: string): Config => {
  const decoded = decodeURIComponent(str);
  const split = decoded.split(/\|/g);
  const [username, listId] = split;

  let type: Config["type"] = "unset";
  let path = "";
  if (split.length > 1) {
    if (split[1] === "list") {
      path = `/${username}/list/${listId}`;
      type = "list";
    } else {
      path = `/${username}`;
      type = "watchlist";
    }
  }

  return {
    path,
    pathSafe: path.replace(/[^A-Za-z0-9]/g, "-"),
    posters: false,
    type,
    listId,
    name: listId.replace(/[^A-Za-z]/g, " "),
    username,
  };
};

/**
 * Parses an encoded URL config to a Config object
 * @param str Encoded URL Config string, which will be (encoded) like this: "/path/to/thing|a|b|c|d"
 * @returns Config object
 */
export const parseConfig = (str: string): Config => {
  /**
   * Expected input: %2Ffcbarcelona%2Flist%2Fmovies-everyone-should-watch-at-least-once%2F%2Cp
   * p = posters
   */
  const decoded = decodeURIComponent(str);
  const split = decoded.split(/\|/g);
  const [path, ...opts] = split;

  if (!path.startsWith("/")) {
    return parseOldConfig(str);
  }

  const reserved = {
    first: [
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

  // Get the Type of link
  const type = ((): Config["type"] => {
    // replace duplicate slashes, then split
    // if "/list or /watchlist", it's a list.
    if (reserved.second.includes(typeOrPerson.toLowerCase())) {
      switch (typeOrPerson.toLowerCase()) {
        case "watchlist":
          return "watchlist";
        case "list":
          return "list";
        default:
          return "unset";
      }
    }

    if (reserved.first.includes(usernameOrReserved.toLowerCase())) {
      return "person";
    }

    console.log("made unset");
    return "unset";
  })();
  console.log({ resolvedType: type });

  const name = ((): Config["name"] => {
    console.log({ type });
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

    return undefined;
  })();
  console.log({ resolvedName: name });

  console.info(
    `Got config: ${path} (${type}) with ${opts.length} options from ${str}`
  );

  const resolvedConfig: Config = {
    ...defaultConfig,
    path,
    pathSafe: path.replace(/[^A-Za-z0-9]/g, "-"),
    type,
    listId,
    name,
    posters: opts.includes("p"),
  };
  console.info({ resolvedConfig });

  return resolvedConfig;
};
