import { useRef, useState } from "react";

export default function Inputbox() {
  const [url, setUrl] = useState("");
  const urlInput = useRef<HTMLInputElement>(null);

  function updateInputUrl() {
    if (urlInput.current?.value) {
      setUrl(urlInput.current.value);
    } else {
      setUrl("");
    }
  }

  function convertToId(url: string) {
    const rletterboxdUrl =
      /https:\/\/(www\.)?letterboxd\.com\/([A-Za-z0-9-_]+)(\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+))?/gi;
    const matches = [...url.matchAll(rletterboxdUrl)];
    let [, , username, , type, listid] = matches[0];
    if (!type) type = "watchlist";
    return `${username}${listid ? `${`|${listid}`}` : ""}`;
  }

  function generateManifestURL() {
    const convertedId = convertToId(url);
    const installUrl = new URL(window.location.href);
    return `stremio://${installUrl.host}/${convertedId}/manifest.json`;
  }

  function copyToClipboard() {
    if (url.length) {
      const manifestUrl = generateManifestURL();
      navigator.clipboard.writeText(manifestUrl).catch((_) => {});
    }
  }

  function installAddon() {
    if (url.length) {
      const manifestUrl = generateManifestURL();
      window.location.href = manifestUrl;
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
          onChange={updateInputUrl}
          onBlur={updateInputUrl}
        />
      </div>
      <div className="flex gap-1">
        <button
          className="grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline"
          onClick={installAddon}
        >
          Install
        </button>
        <button
          className="grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal"
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
    </div>
  );
}
