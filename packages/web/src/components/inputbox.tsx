import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  config,
  type ConfigFormInput,
  ConfigFormInputSchema,
} from "@stremio-addon/config";
import { z } from "astro/zod";
import { sortOptions } from "@/lib/sortOptions";

function SortOption(props: { name: string; url: string }) {
  return (
    <option value={props.url} key={props.url}>
      {props.name}
    </option>
  );
}

const NamePlaceholders = [
  "Movies I Pretend to Have Seen",
  "Films That Made Me Ugly Cry",
  "My Netflix Queue of Eternal Shame",
  "Movies I Started but Never Finished",
  "Films I Love but Can't Admit Publicly",
  "Movies That Are Definitely Not Rom-Coms",
  "Films I Watch When I Need to Feel Smart",
  "My 'It's So Bad It's Good' Collection",
  "Movies I Quote Way Too Often",
  "Films That Ruined My Sleep Schedule",
  "Movies I Watch to Procrastinate Adulting",
  "Films That Made Me Question Reality",
  "My 'Watch This When Sick' Collection",
  "Movies I Judge People For Not Liking",
  "Films I'll Never Admit Scared Me",
  "My Comfort Food Cinema Selection",
  "Movies That Broke My Heart (And I Liked It)",
  "Films I Use to Test New Speakers",
  "My 'Background Noise While Cleaning' List",
  "Movies That Made Me Google the Ending",
];

/**
 * Resolves a Boxt.it URL to the final destination.
 * @param url A Boxt.it URL
 * @returns Resolved URL
 */
async function resolveUrl(url: string) {
  const encodedUrl = encodeURIComponent(url);

  const res = await fetch(`/api/resolve/${encodedUrl}`, {
    headers: { "cache-control": "no-cache" },
  });
  if (res.ok) {
    const resolvedUrl = await res.text();
    return resolvedUrl;
  } else {
    throw new Error(`Failed to resolve URL: ${res.statusText}`);
  }
}

async function getConfigFromId(id: string): ReturnType<typeof config.decode> {
  try {
    const res = await fetch(`/api/config/${id}`, {
      headers: { "cache-control": "max-age: 600" },
    });
    if (res.ok) {
      const json = await res.json();

      const parsed = z
        .object({
          success: z.boolean(),
          config: z.object({
            url: z.string().url(),
            catalogName: z.string(),
            posterChoice: z.enum([
              "letterboxd",
              "cinemeta",
              "letterboxd-ratings",
              "letterboxd-custom-from-list",
              "rpdb",
            ]),
            rpdbApiKey: z.string(),
            origin: z.string().url(),
          }),
        })
        .parse(json);

      if (parsed.success && parsed.config) {
        return parsed.config;
      } else {
        console.warn("Failed to fetch config from ID", parsed);
      }
    } else {
      console.warn("Failed to fetch config from ID", res.statusText);

      window.location.href = "/configure";
    }
  } catch (error) {
    console.warn("Failed to fetch config from ID", error);
  }

  return undefined;
}

export default function Inputbox() {
  const [formDisabled, setFormDisabled] = useState(false);
  const [manifestUrl, setManifestUrl] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);
  const { register, handleSubmit, formState, setValue, watch, reset } =
    useForm<ConfigFormInput>({
      resolver: zodResolver(ConfigFormInputSchema),
    });
  const watchedPosterChoice = watch("posterChoice");
  const watchedUrl = watch("url");

  // initial load if the URL has an ID in it, load that config
  useEffect(() => {
    const configId = new URLSearchParams(window.location.search).get("id");
    if (configId) {
      getConfigFromId(configId).then((conf) => {
        if (conf) {
          // set the form values
          setValue("url", conf.url);
          setValue("catalogName", conf.catalogName ?? "");
          setValue("posterChoice", conf.posterChoice ?? "letterboxd");
          setValue("rpdbApiKey", conf.rpdbApiKey ?? "");
        }
      });
    }
  }, []);

  /**
   * Fetches a recommendation from the server and sets the URL field.
   */
  async function recommendList() {
    try {
      const res = await fetch("/api/recommend", {
        headers: { "cache-control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch recommendation: ${res.statusText}`);
      }
      const json = await res.json();
      const { recommendation } = z
        .object({ recommendation: z.string() })
        .parse(json);
      const recommendedUrl = `https://letterboxd.com${recommendation}`;
      const resolvedUrl = await resolveUrl(recommendedUrl);
      setValue("url", resolvedUrl);
      setManifestUrl("");
    } catch (error) {
      console.warn(error);
    }
  }

  /**
   * Generates the manifest URL for the given configuration.
   *
   * Note: When in dev the protocol is `http`, in production it is `stremio`.
   */
  async function generateManifestURL(data: ConfigFormInput) {
    try {
      // verify with server
      const encodedConfig = await config.encode({
        ...data,
        origin: location.origin,
      });

      // change the protocol for installation in production
      const { origin } = new URL(location.href);
      const newOrigin = origin.startsWith("https")
        ? origin.replace(/^https/, "stremio")
        : origin;

      const res = await fetch(`/api/config/${encodedConfig}`, {
        method: "POST",
        headers: { "cache-control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to generate manifest: ${res.statusText}`);
      }
      const json = await res.json();
      const parsed = z
        .object({ id: z.string(), success: z.boolean() })
        .parse(json);

      if (!parsed.success) {
        throw new Error("Failed to generate manifest");
      }

      return `${newOrigin}/${parsed.id}/manifest.json`;
    } catch (error) {
      // @ts-expect-error Message exists
      toast.error(`Try again in a few seconds: ${error.message}`);
    }
  }

  /**
   * Handles the submission of the form.
   */
  async function onSubmit(data: ConfigFormInput) {
    setManifestUrl("");
    if (!data.url) {
      toast.error("Please enter a valid URL");
      return;
    }
    const url = await generateManifestURL(data);
    if (url) {
      setManifestUrl(url);
      toast.success("Generated, install or copy!");
    } else {
      toast.error("Error occurred, please try again.");
    }
  }

  /**
   * Copies the manifest URL to the clipboard and displays a toast.
   */
  async function copyToClipboard() {
    try {
      if (manifestUrl?.length === 0) return;
      await navigator.clipboard.writeText(manifestUrl);
      toast.success("Copied, paste in Stremio!");
    } catch (error) {
      // @ts-expect-error Message exists
      toast.error(error.message);
    }
  }

  /**
   * Redirects the browser to the manifest URL to install the addon.
   *
   * Note: In dev, the protocol is `http`, in production it is `stremio`.
   * So in development you'll be redirected to the manifest.
   */
  async function installAddon() {
    window.location.href = manifestUrl;
  }

  /**
   * Opens a new window/tab to install the addon on the web version.
   */
  async function installWeb() {
    window.open(
      `https://web.stremio.com/#/addons?addon=${encodeURIComponent(manifestUrl)}`
    );
  }

  /**
   * Applies a sort to the URL.
   */
  function applySort() {
    const selectedSort = selectRef.current?.value;
    if (!selectedSort) return;

    let url = watchedUrl;
    if (!url) return;

    // disable the form
    setFormDisabled(true);

    // ensure the url ends in a slash
    if (!url.endsWith("/")) {
      url += "/";
    }

    // if there is already a sort applied, remove it
    for (const option of sortOptions) {
      if (url.includes(option.url)) {
        url = url.replace(option.url.slice(1), "");
      }
    }
    // apply the new sort
    setValue("url", url + selectedSort.slice(1));
    setFormDisabled(false);
  }

  return (
    <div>
      <Toaster />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-2">
          <div className="text-base">
            A Letterboxd URL containing a list of posters (including any
            sorting!):
          </div>
          <div className="flex flex-col gap-1 sm:flex-row">
            <input
              type="text"
              placeholder="https://letterboxd.com/almosteffective/watchlist/"
              {...register("url")}
              disabled={formDisabled}
              onBlur={() => {
                if (watchedUrl.length === 0) return;
                setFormDisabled(true);
                resolveUrl(watchedUrl)
                  .then((resolvedUrl) => {
                    setFormDisabled(false);
                    if (resolvedUrl) {
                      setValue("url", resolvedUrl);
                    }
                  })
                  .catch((error) => {
                    setFormDisabled(false);
                    console.warn(error);
                    toast.error("Failed to resolve URL");
                  });
              }}
              className="w-full border border-black bg-white text-[#202830] rounded text-xl px-2 py-1 disabled:text-gray-200"
            />
            <button
              className="grow border border-white bg-white uppercase text-[#202830] text-lg p-2 rounded font-bold hover:bg-[#202830] hover:text-white hover:underline"
              onClick={recommendList}
              disabled={formState.isSubmitting || formDisabled}
              type="button"
            >
              Recommend
            </button>
          </div>
          <div className="flex gap-1">
            <div className="w-2xs">Apply sorting</div>
            <select
              className="border border-black text-[#202830] bg-white rounded text-xl px-2 py-1 w-full"
              id="sort"
              name="sort"
              ref={selectRef}
            >
              {sortOptions.map((option) => (
                <SortOption
                  key={option.url}
                  name={option.name}
                  url={option.url}
                />
              ))}
            </select>
            <button
              onClick={applySort}
              className="w-2xs border border-white rounded"
              type="button"
            >
              Apply
            </button>
          </div>
          <div className="text-base">
            Set a custom name if you'd like (leave empty to auto-generate):
          </div>
          <div>
            <input
              type="text"
              placeholder={
                NamePlaceholders[
                  Math.floor(Math.random() * NamePlaceholders.length)
                ]
              }
              {...register("catalogName")}
              className="w-full border border-black bg-white text-[#202830] rounded text-xl px-2 py-1"
            />
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="text-base self-center text-center sm:text-left">
              What posters do you want to use?
            </div>
            <div>
              <select
                className="border border-black text-[#202830] bg-white rounded text-xl px-2 py-1 w-full"
                {...register("posterChoice")}
              >
                <option value="letterboxd-custom-from-list">
                  Letterboxd (including custom)
                </option>
                <option value="letterboxd">Letterboxd</option>
                <option value="cinemeta">Cinemeta</option>
                <option value="letterboxd-ratings">
                  Letterboxd With Ratings
                </option>
                <option value="rpdb">Ratings Poster Database</option>
              </select>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-1 sm:grid-cols-2 ${
              watchedPosterChoice === "rpdb" ? "" : "hidden"
            }`}
          >
            <div className="text-base self-center text-center sm:text-left">
              Your RPDb API Key (optional):
            </div>
            <div>
              <input
                type="text"
                placeholder="RPDb API Key"
                className="w-full border border-white text-white rounded text-xl px-2 py-1"
                {...register("rpdbApiKey", {
                  deps: ["posterChoice"],
                })}
              />
            </div>
          </div>

          <div className="mx-auto flex gap-1">
            <button
              className="col-span-3 grow border border-white bg-white uppercase text-[#202830] text-lg p-2 rounded font-bold cursor-pointer hover:bg-[#202830] hover:text-white hover:underline"
              disabled={formState.isSubmitting || formDisabled}
              type="submit"
            >
              {formState.isSubmitting === false
                ? "Generate Manifest"
                : "Validating..."}
            </button>
            <button
              className="col-span-3 grow border border-transparent bg-auto uppercase text-white text-lg p-2 rounded cursor-pointer hover:bg-[#202830] hover:text-white hover:underline"
              disabled={formState.isSubmitting}
              onClick={() => {
                setManifestUrl("");
                reset();
              }}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-1 justify-around">
            <div
              className={`${!manifestUrl?.length ? "hidden" : ""} flex gap-1 justify-around grow`}
            >
              <button
                className="grow border border-white bg-white uppercase text-[#202830] text-lg p-2 rounded font-bold hover:bg-[#202830] hover:text-white hover:underline"
                onClick={installAddon}
                hidden={manifestUrl?.length === 0}
                type="button"
              >
                Install
              </button>
              <button
                className="grow border border-white bg-white uppercase text-[#202830] text-lg p-2 rounded font-bold hover:bg-[#202830] hover:text-white hover:underline"
                onClick={installWeb}
                hidden={manifestUrl?.length === 0}
                type="button"
              >
                Install to web
              </button>
              <button
                className="grow border border-transparent hover:border-white bg-[#202830] uppercase text-white text-lg p-2 rounded font-normal"
                onClick={copyToClipboard}
                hidden={manifestUrl?.length === 0}
                type="submit"
              >
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
