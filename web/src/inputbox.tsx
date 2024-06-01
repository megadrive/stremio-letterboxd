import { useRef, useState } from "react";

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
      ? "http://localhost:3030"
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
      const res = await fetch(`${base}/verify/${toVerify}`);
      if (!res.ok) {
        const message = await res.json();
        alert(message);
        return;
      }
      const manifestUrl = await res.json();
      return manifestUrl;
    } catch (error) {
      // @ts-ignore
      alert(`Try again in a few seconds: ${error.message}`);
    }

    return "";
  }

  async function copyToClipboard() {
    setInProgress(true);
    updateInputUrl();
    const manifestUrl = await generateManifestURL();
    if (manifestUrl.length) {
      setManifest(manifestUrl);
      await navigator.clipboard
        .writeText(manifestUrl)
        .then(() => alert("Copied, paste in Stremio!"))
        .catch((_) => {
          setInProgress(false);
        });
    }
    setInProgress(false);
  }

  async function installAddon() {
    try {
      setInProgress(true);
      updateInputUrl();
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
            {inProgress === false ? "Install" : "..."}
          </button>
          <button
            className="grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal"
            onClick={copyToClipboard}
            disabled={inProgress}
          >
            {inProgress === false ? "Copy" : "..."}
          </button>
        </div>
        <div className="hidden">{manifest}</div>
      </div>
    </div>
  );
}
