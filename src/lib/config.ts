type Config = {
  username: string;
  letterboxdPosters: boolean;
};

const defaultConfig: Config = {
  username: "",
  letterboxdPosters: false,
};

const map = {
  p: "letterboxdPosters",
};

export const parseConfig = (str: string): Config => {
  /**
   * Expected input: username|listname,p,
   * p = letterboxdPosters
   */
  const split = decodeURIComponent(str).split(/,/g);
  const [username] = split;

  return {
    ...defaultConfig,
    username,
    letterboxdPosters: split.includes("p", 1),
  };
};
