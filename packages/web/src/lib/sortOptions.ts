type SortOption = {
  name: string;
  url: string;
};

export const sortOptions: SortOption[] = [
  { name: "List Order", url: "/" },
  {
    name: "Reversed",
    url: "/by/reverse/",
  },
  {
    name: "Name",
    url: "/by/name/",
  },
  {
    name: "Popular",
    url: "/by/popular/",
  },
  {
    name: "Shuffled",
    url: "/by/shuffle/",
  },
  {
    name: "When added - Newest first",
    url: "/by/added/",
  },
  {
    name: "When added - Earliest first",
    url: "/by/added-earliest/",
  },
  {
    name: "Release date - Newest first",
    url: "/by/release/",
  },
  {
    name: "Release date - Earliest first",
    url: "/by/release-earliest/",
  },
];
