import { Toaster, toast } from "react-hot-toast";
import { config, type Config } from "@stremio-addon/config";
import React from "react";

function List(conf: Config) {
  const [installUrl, setInstallUrl] = React.useState<string>("");

  React.useEffect(() => {
    async function generateManifestURL() {
      try {
        const encodedConfig = await config.encode(conf);

        const url = new URL(window.location.href);
        const newOrigin = url.origin.replace(/^https/, "stremio");

        const res = await fetch(`/api/config/${encodedConfig}`, {
          method: "POST",
          headers: { "cache-control": "no-cache" },
        });

        if (!res.ok) {
          throw new Error(`Failed to generate manifest: ${res.statusText}`);
        }

        const json = await res.json();
        if (!json.success || !json.id) {
          throw new Error("Failed to generate manifest");
        }

        setInstallUrl(`${newOrigin}/${json.id}/manifest.json`);
      } catch (error) {
        console.error("Failed to generate manifest URL:", error);
        toast.error("Failed to generate install URL");
      }
    }

    generateManifestURL();
  }, [conf]);

  function installList() {
    window.location.href = installUrl;
  }

  return (
    <div className="grid gap-2 grid-cols-2">
      <div className="text-right">
        <a href={conf.url} className="italic hover:underline">
          {conf.catalogName}
        </a>
      </div>
      <div className="grid grid-flow-col grid-cols-3 gap-1">
        <button
          className="border border-white rounded hover:bg-white hover:text-black"
          type="button"
          onClick={installList}
        >
          Install
        </button>
        <button
          className="border border-transparent rounded hover:border-white"
          type="button"
          onClick={() =>
            window.open(
              `https://web.stremio.com/#/addons?addon=${encodeURIComponent(installUrl)}`,
              "_blank"
            )
          }
        >
          Web
        </button>
        <button
          className="border border-transparent rounded hover:border-white"
          type="button"
          onClick={() =>
            navigator.clipboard
              .writeText(installUrl)
              .then(() => toast.success("Copied, paste in Stremio!"))
          }
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default function Popular() {
  return (
    <div>
      <Toaster />
      <h2 className="text-center font-semibold text-xl mb-2">Popular lists</h2>
      <div className="grid gap-1">
        <List
          origin={location.origin}
          catalogName="Popular This Week"
          url="https://letterboxd.com/films/popular/this/week/"
          fullMetadata
          posterChoice="letterboxd"
        />
        <List
          origin={location.origin}
          catalogName="Popular This Month"
          url="https://letterboxd.com/films/popular/this/month/"
          fullMetadata
          posterChoice="letterboxd"
        />
      </div>
    </div>
  );
}
