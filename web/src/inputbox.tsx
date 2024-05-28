import { useRef, useState } from "react";

export default function Inputbox() {
  const [url, setUrl] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [manifest, setManifest] = useState("");
  const urlInput = useRef<HTMLInputElement>(null);

  function updateInputUrl() {
    if (urlInput.current?.value) {
      setUrl(urlInput.current.value);
    } else {
      setUrl("");
    }
  }

  /**
   * Resolves a URL after redirects. Returns undefined if an error occurs or not a letterboxd URL.
   * @param url URL to resolve
   * @returns Resolved URL
   */
  async function resolveUrl(url: string) {
    const rletterboxdUrl = /^https:\/\/(www\.)?letterboxd\.com\//gi;
    const rboxditUrl = /^https:\/\/boxd\.it\/.+/gi;
    const originalUrl = url;

    // if it's an boxd.it URL, resolve to a Letterboxd URL.
    if (rboxditUrl.test(url)) {
      console.log(`boxdit url: ${url}`);
      try {
        const res = await fetch(`/url/${encodeURIComponent(url)}`);
        if (!res.ok) {
          return undefined;
        }
        const realUrl = await res.json();
        url = realUrl;
        console.log(`resolved url: ${url}`);
      } catch {
        console.error(`Error occurred while resolving.`);
        return undefined;
      }
    }

    if (!rletterboxdUrl.test(url)) {
      console.error(`bad resolved url: ${url} from ${originalUrl}`);
      return undefined;
    }

    return encodeURIComponent(url);
  }

  async function generateManifestURL() {
    try {
      const resolvedUrl = await resolveUrl(url);
      if (!resolvedUrl) {
        throw Error("Conversion failed.");
      }
      const host = new URL(window.location.href).host;
      return `stremio://${host}/${resolvedUrl}/manifest.json`;
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
    <div className="grid grid-cols-1 gap-1">
      <div className="text-base">
        A Letterboxd URL containing a list of posters (including any sorting!):
      </div>
      <div>
        <input
          type="text"
          placeholder="https://letterboxd.com/almosteffective/watchlist"
          className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
          ref={urlInput}
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
  );
}
