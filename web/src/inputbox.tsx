import { useRef, useState } from "react";

export default function Inputbox() {
  const [url, setUrl] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const urlInput = useRef<HTMLInputElement>(null);

  function updateInputUrl() {
    if (urlInput.current?.value) {
      setUrl(urlInput.current.value);
    } else {
      setUrl("");
    }
  }

  async function convertToId(url: string) {
    const rletterboxdUrl =
      /https:\/\/(www\.)?letterboxd\.com\/([A-Za-z0-9-_]+)(\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+))?/gi;
    const rboxditUrl = /https:\/\/boxd\.it\/.+/gi;

    console.log(url);
    if (rboxditUrl.test(url)) {
      console.log(`boxdit_url: ${url}`);
      const realUrl = await (
        await fetch(`/url/${encodeURIComponent(url)}`)
      ).json();
      url = realUrl;
      console.log(`resolved url: ${url}`);
    }

    const matches = [...url.matchAll(rletterboxdUrl)];
    let [, , username, , type, listid] = matches[0];
    if (!type) type = "watchlist";
    return `${username}${listid ? `${`|${listid}`}` : ""}`;
  }

  async function generateManifestURL() {
    try {
      const convertedId = await convertToId(url);
      const installUrl = new URL(window.location.href);
      return `stremio://${installUrl.host}/${convertedId}/manifest.json`;
    } catch (error) {
      alert("Try again in a few seconds.");
    }

    return "";
  }

  async function copyToClipboard() {
    setInProgress(true);
    if (url.length) {
      updateInputUrl();
      const manifestUrl = await generateManifestURL();
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
      if (url.length) {
        updateInputUrl();
        const manifestUrl = await generateManifestURL();
        window.location.href = manifestUrl;
      }
      setInProgress(false);
    } catch (error) {
      setInProgress(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-1">
      <div className="text-base">A user's Letterboxd URL or a List URL:</div>
      <div>
        <input
          type="text"
          placeholder="https://letterboxd.com/almosteffective"
          className="w-full border border-black text-tailwind rounded text-xl px-2 py-1"
          ref={urlInput}
          onKeyDown={updateInputUrl}
          onKeyUp={updateInputUrl}
          onChange={updateInputUrl}
          onBlur={updateInputUrl}
          onPaste={updateInputUrl}
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
    </div>
  );
}
