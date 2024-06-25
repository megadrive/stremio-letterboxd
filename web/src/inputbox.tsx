import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function Inputbox() {
  const [url, setUrl] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [manifest, setManifest] = useState("");
  const [customListName, setCustomListName] = useState("");
  const [manifestUrl, setManifestUrl] = useState("");
  const [config, setConfig] = useState<{ path: string; catalogName: string }>();
  const urlInput = useRef<HTMLInputElement>(null);
  const customListNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providedConfigId = params.get("id") ?? "";

    // get the config if the ID exists.
    if (providedConfigId) {
      setInProgress(true);
      const base = window.location.origin.includes(":4321")
        ? "http://localhost:3030"
        : window.location.origin;
      fetch(`${base}/getConfig/${encodeURIComponent(providedConfigId)}`)
        .then((res) => res.json())
        .then((gotConfig: typeof config) => {
          if (!gotConfig) throw new Error("No config found");

          setConfig(gotConfig);
          setCustomListName(gotConfig.catalogName);
          const configToProvide = encodeURIComponent(
            `${gotConfig.path}${
              gotConfig.catalogName ? `|cn=${gotConfig.catalogName}` : ""
            }`,
          );
          setManifest(`${base}/${configToProvide}/manifest.json`);
        })
        .catch((error) => {
          console.warn(error);
        })
        .finally(() => {
          setInProgress(false);
        });
    }
  }, []);

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
      setUrl(recommendedUrl);
      if (urlInput.current) urlInput.current.value = recommendedUrl;
      setManifestUrl("");
    } catch (error) {
      console.warn(error);
    }
  }

  function updateInputUrl() {
    if (urlInput.current?.value) {
      setUrl(urlInput.current.value);
    } else {
      setUrl("");
    }
  }

  function updateCustomListName() {
    if (customListNameInput.current?.value) {
      setCustomListName(customListNameInput.current.value);
    } else {
      setCustomListName("");
    }
  }

  /**
   * Resolves a URL after redirects. Returns undefined if an error occurs or not a letterboxd URL.
   * @param url URL to resolve
   * @returns Resolved URL
   */
  async function generateManifestURL() {
    const base = window.location.origin.includes(":4321")
      ? "http://localhost:3030"
      : window.location.origin;
    try {
      const toVerify = btoa(
        JSON.stringify({
          url,
          base,
          posters: false,
          customListName: customListName.length ? customListName : undefined,
        }),
      );
      // if the url is the same, we don't need to verify it again
      const res = await fetch(`${base}/verify/${toVerify}`, {
        headers: {
          "Cache-Control": "max-age=3600, stale-while-revalidate=600",
        },
      });
      if (!res.ok) {
        const message = await res.json();
        toast.error(message);
        return;
      }
      const manifestUrl = await res.json();
      console.log({ manifestUrl });
      setManifestUrl(manifestUrl);
    } catch (error) {
      // @ts-ignore
      toast.error(`Try again in a few seconds: ${error.message}`);
    }
  }

  async function generateManifest() {
    updateInputUrl();
    setManifest("");
    if (url.length === 0) {
      toast.error("Please enter a valid URL");
      return;
    }
    setInProgress(true);
    await generateManifestURL();
    if (manifestUrl.length) {
      setManifest(manifestUrl);
    }
    setInProgress(false);
  }

  async function copyToClipboard() {
    try {
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
      <div className="grid grid-cols-1 gap-1">
        <div className="text-base">
          A Letterboxd URL containing a list of posters (including any
          sorting!):
        </div>
        <div className="flex flex-row gap-1">
          <input
            type="text"
            placeholder="https://letterboxd.com/almosteffective/watchlist"
            className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
            ref={urlInput}
            onPaste={updateInputUrl}
            onKeyDown={updateInputUrl}
            onKeyUp={updateInputUrl}
            onBlur={updateInputUrl}
            onFocus={updateInputUrl}
            defaultValue={
              config?.path
                ? `https://letterboxd.com${decodeURIComponent(config.path)}`
                : ""
            }
          />
          <button
            className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
            onClick={recommendList}
            disabled={inProgress}
            type="button"
          >
            {inProgress === false ? "Recommend" : "Validating..."}
          </button>
        </div>
        <div className="text-base">
          Set a custom list if you'd like (leave empty to auto-generate):
        </div>
        <div>
          <input
            type="text"
            placeholder="My Cool List Name"
            className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
            ref={customListNameInput}
            onPaste={updateCustomListName}
            onKeyDown={updateCustomListName}
            onKeyUp={updateCustomListName}
            onBlur={updateCustomListName}
            onFocus={updateCustomListName}
            defaultValue={
              config?.catalogName
                ? `${decodeURIComponent(config.catalogName)}`
                : ""
            }
          />
        </div>
        <div className="grid gap-1 grid-cols-2 grid-rows-2">
          <button
            className="col-span-2 grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
            onClick={generateManifest}
            disabled={inProgress}
            type="button"
          >
            {inProgress === false ? "Generate Manifest" : "Validating..."}
          </button>
          <button
            className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
            onClick={installAddon}
            hidden={inProgress || manifestUrl.length === 0}
            type="button"
          >
            {inProgress === false ? "Install" : "Validating..."}
          </button>
          <button
            className="grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal"
            onClick={copyToClipboard}
            hidden={inProgress || manifestUrl.length === 0}
            type="submit"
          >
            {inProgress === false ? "Copy" : "Validating..."}
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
    </div>
  );
}
