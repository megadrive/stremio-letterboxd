import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfigSchema, type Config } from "@stremio-addon/config";
import { z } from "astro/zod";

export default function Inputbox() {
  const [manifestUrl, setManifestUrl] = useState("");
  const { register, handleSubmit, formState, setValue, watch } =
    useForm<Config>({
      resolver: zodResolver(ConfigSchema),
    });
  const watchedPosterChoice = watch("posterChoice");

  async function recommendList() {
    try {
      const res = await fetch("/recommend", {
        headers: { "cache-control": "no-cache" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch recommendation: ${res.statusText}`);
      }
      const json = await res.json();
      const recommendation = z.string().parse(json);
      const recommendedUrl = `https://letterboxd.com${recommendation}`;
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
  async function generateManifestURL(data: Config) {
    try {
      // verify with server
      const res = await fetch(`/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to verify");
      }

      const manifestUrlResponse = await res.json();
      const manifestUrl = z
        .object({ manifestUrl: z.string() })
        .parse(manifestUrlResponse).manifestUrl;

      return manifestUrl;
    } catch (error) {
      // @ts-expect-error Message exists
      toast.error(`Try again in a few seconds: ${error.message}`);
    }
  }

  async function onSubmit(data: Config) {
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
      // @ts-expect-error Message exists
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
              {...register("catalogName")}
              className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
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
                <option value="letterboxd-ratings">
                  Letterboxd with ratings
                </option>
                <option value="letterboxd-custom-from-list">
                  Letterboxd Custom List
                </option>
                <option value="rpdb">RPDB</option>
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
                className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
                {...register("rpdbApiKey", {
                  deps: ["posterChoice"],
                })}
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
        </div>
      </form>
    </div>
  );
}
