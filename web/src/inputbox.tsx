import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "astro/zod";

const posterChoices = ["cinemeta", "letterboxd", "rpdb"] as const;
type PosterChoice = (typeof posterChoices)[number];

const schema = z.object({
  url: z.string().url(),
  customListName: z.string().optional(),
  ignoreUnreleased: z.boolean().optional(),
  posterChoice: z.enum(["cinemeta", "letterboxd", "rpdb"]).optional(),
  rpdbApiKey: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Inputbox() {
  const [config, setConfig] = useState<{
    path: string;
    catalogName: string;
    ignoreUnreleased: boolean;
    posterChoice: PosterChoice;
    rpdbApiKey?: string;
  }>();
  const [manifestUrl, setManifestUrl] = useState("");
  const { register, handleSubmit, formState, setValue, resetField, watch } =
    useForm<FormData>({
      resolver: zodResolver(schema),
    });
  const watchedPosterChoice = watch("posterChoice");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providedConfigId = params.get("id") ?? "";

    // get the config if the ID exists.
    if (providedConfigId) {
      formState.disabled = true;
      const base = window.location.origin.includes(":4321")
        ? "http://localhost:3030"
        : window.location.origin;
      fetch(`${base}/getConfig/${encodeURIComponent(providedConfigId)}`)
        .then((res) => res.json())
        .then((gotConfig: typeof config) => {
          if (!gotConfig) throw new Error("No config found");

          setConfig(gotConfig);
          setValue("customListName", gotConfig.catalogName);
          setValue("ignoreUnreleased", gotConfig.ignoreUnreleased);
          setValue("rpdbApiKey", gotConfig.rpdbApiKey);
          const configToProvide = encodeURIComponent(
            `${gotConfig.path}${
              gotConfig.catalogName ? `|cn=${gotConfig.catalogName}` : ""
            }${gotConfig.ignoreUnreleased ? "|iu" : ""}${
              gotConfig.posterChoice ? `|p=${gotConfig.posterChoice}` : ""
            }${gotConfig.rpdbApiKey ? `|rpdb=${gotConfig.rpdbApiKey}` : ""}`,
          );
          setManifestUrl(`${base}/${configToProvide}/manifest.json`);
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => {
          formState.disabled = false;
        });
    }
  }, [setValue, formState]);

  async function recommendList() {
    const base = window.location.origin.includes(":4321")
      ? "http://localhost:3030"
      : window.location.origin;
    try {
      const res = await fetch(`${base}/recommend`, {
        headers: { "cache-control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch list page: ${res.statusText}`);
      }
      const json = (await res.json()) as string;
      const recommendedUrl = `https://letterboxd.com${json}`;
      setValue("url", recommendedUrl);
      setManifestUrl("");
    } catch (error) {
      console.warn(error);
    }
  }

  /**
   * Resolves a URL after redirects. Returns undefined if an error occurs or not a letterboxd URL.
   * @param url URL to resolve
   * @returns Resolved URL
   */
  async function generateManifestURL(data: FormData) {
    const base = window.location.origin.includes(":4321")
      ? "http://localhost:3030"
      : window.location.origin;
    try {
      const toVerify = JSON.stringify({
        url: data.url,
        base,
        customListName: data.customListName,
        ignoreUnreleased: data.ignoreUnreleased,
        posterChoice: data.posterChoice,
        rpdbApiKey: data.rpdbApiKey,
      });
      // if the url is the same, we don't need to verify it again

      console.log({ toVerify });

      const res = await fetch(`${base}/verify/${btoa(toVerify)}`, {
        headers: {
          "Content-Type": "application/json",
        },
        // method: "POST",
        cache: "no-cache",
      });
      if (!res.ok) {
        const message = await res.json();
        toast.error(message);
        return;
      }
      const manifestUrl = await res.json();
      console.log({ manifestUrl });
      setManifestUrl(manifestUrl);
      return manifestUrl;
    } catch (error) {
      // @ts-ignore
      toast.error(`Try again in a few seconds: ${error.message}`);
    }
  }

  async function onSubmit(data: FormData) {
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

  async function copyToClipboard() {
    try {
      if (manifestUrl?.length === 0) return;
      await navigator.clipboard.writeText(manifestUrl);
      toast.success("Copied, paste in Stremio!");
    } catch (error) {
      // @ts-ignore
      toast.error(error.message);
    }
  }

  async function installAddon() {
    window.location.href = manifestUrl;
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
              placeholder="https://letterboxd.com/almosteffective/watchlist"
              {...register("url")}
              className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
              defaultValue={
                config?.path
                  ? `https://letterboxd.com${decodeURIComponent(config.path)}`
                  : ""
              }
            />
            <button
              className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
              onClick={recommendList}
              disabled={formState.isSubmitting}
              type="button"
            >
              {formState.isSubmitting === false ? "Recommend" : "Validating..."}
            </button>
          </div>
          <div className="text-base">
            Set a custom list if you'd like (leave empty to auto-generate):
          </div>
          <div>
            <input
              type="text"
              placeholder="My Cool List Name"
              {...register("customListName")}
              className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
              defaultValue={
                config?.catalogName
                  ? `${decodeURIComponent(config.catalogName)}`
                  : ""
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="text-base self-center text-center sm:text-left">
              What posters do you want to use?
            </div>
            <div>
              <select
                className="border border-black text-tailwind rounded text-xl px-2 py-1 w-full"
                {...register("posterChoice")}
              >
                <option value="cinemeta">Cinemeta (default)</option>
                <option value="letterboxd">Letterboxd</option>
                <option value="rpdb">RPDB</option>
              </select>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 gap-1 sm:grid-cols-2 ${watchedPosterChoice === "rpdb" ? "" : "hidden"}`}
          >
            <div className="text-base self-center text-center sm:text-left">
              Your RPDb API Key (optional):
            </div>
            <div>
              <input
                type="text"
                placeholder="RPDb API Key"
                className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
                {...register("rpdbApiKey")}
              />
            </div>
          </div>

          <div className="grid gap-1 grid-cols-2 grid-rows-2">
            <button
              className="col-span-2 grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
              disabled={formState.isSubmitting}
              type="submit"
            >
              {formState.isSubmitting === false
                ? "Generate Manifest"
                : "Validating..."}
            </button>
            <button
              className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
              onClick={installAddon}
              hidden={manifestUrl?.length === 0}
              type="button"
            >
              {formState.isSubmitting === false ? "Install" : "Validating..."}
            </button>
            <button
              className="grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal"
              onClick={copyToClipboard}
              hidden={manifestUrl?.length === 0}
              type="submit"
            >
              {formState.isSubmitting === false ? "Copy" : "Validating..."}
            </button>
          </div>
          <div className="hidden">
            <div>
              <a href={manifestUrl}>{manifestUrl}</a>
            </div>
            <div>
              {window.navigator.userActivation.hasBeenActive
                ? "User has been active"
                : "User has not been active"}
            </div>
            <div>
              {window.navigator.userActivation.isActive
                ? "User is active"
                : "User is not active"}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
