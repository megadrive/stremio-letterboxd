import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function Inputbox() {
  const [url, setUrl] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [manifest, setManifest] = useState("");
  const [customListName, setCustomListName] = useState("");
  const urlInput = useRef<HTMLInputElement>(null);
  const customListNameInput = useRef<HTMLInputElement>(null);

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
      ? "http://192.168.20.27:3030"
      : window.location.origin;
    try {
      const toVerify = btoa(
        JSON.stringify({
          url,
          base,
          posters: false,
          customListName: customListName.length ? customListName : undefined,
        })
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
      return manifestUrl;
    } catch (error) {
      // @ts-ignore
      toast.error(`Try again in a few seconds: ${error.message}`);
    }

    return "";
  }

  async function copyToClipboard() {
    updateInputUrl();
    if (url.length === 0) {
      toast.error("Please enter a valid URL");
      return;
    }
    setInProgress(true);
    const manifestUrl = await generateManifestURL();
    if (manifestUrl.length) {
      setManifest(manifestUrl);
      try {
        await navigator.clipboard.writeText(manifestUrl);
        toast.success("Copied, paste in Stremio!");
      } catch (error) {
        // @ts-ignore
        toast.error(error.message);
      }
    }
    setInProgress(false);
  }

  async function installAddon() {
    try {
      updateInputUrl();
      if (url.length === 0) {
        toast.error("Please enter a valid URL");
        return;
      }
      setInProgress(true);
      const manifestUrl = await generateManifestURL();
      if (manifestUrl.length) {
        setManifest(manifestUrl);
        window.location.href = manifestUrl;
        setInProgress(false);
      }
    } catch (error) {
      setInProgress(false);
    }
  }

  return (
    <div>
      <Toaster />
      <div className="grid grid-cols-1 gap-1">
        <div className="text-base">
          A Letterboxd URL containing a list of posters (including any
          sorting!):
        </div>
        <div>
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
          />
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
          />
        </div>
        <div className="flex gap-1">
          <button
            className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
            onClick={installAddon}
            disabled={inProgress}
          >
            {inProgress === false ? "Install" : "Validating..."}
          </button>
          <button
            className="grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal"
            onClick={copyToClipboard}
            disabled={inProgress}
          >
            {inProgress === false ? "Copy" : "Validating..."}
          </button>
        </div>
        <div className={`${true ? "" : "hidden"}`}>
          <div>
            <a href={manifest}>{manifest}</a>
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
