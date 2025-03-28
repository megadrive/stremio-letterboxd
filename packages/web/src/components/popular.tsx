import { Toaster, toast } from "react-hot-toast";
import { config, type Config } from "@stremio-addon/config";
import React from "react";

function List(conf: Config) {
  const [encodedConfig, setEncodedConfig] = React.useState<string>("");
  const [installUrl, setInstallUrl] = React.useState<string>("");

  React.useEffect(() => {
    config.encode(conf).then((encoded) => {
      setEncodedConfig(encoded);
    });

    setInstallUrl(
      `${new URL(location.href).origin}/${encodedConfig}/manifest.json`.replace(
        /https?/,
        "stremio"
      )
    );
  }, [config]);

  function installList() {
    window.location.href = installUrl;
  }

  return (
    <div className="grid gap-2 grid-cols-2">
      <div className="text-right">
        <a href={installUrl} className="italic hover:underline">
          {conf.catalogName}
        </a>
      </div>
      <div className="grid grid-flow-col grid-cols-2 gap-1">
        <button
          className="border border-white rounded hover:bg-white hover:text-tailwind"
          type="button"
          onClick={installList}
        >
          Install
        </button>
        <button
          className="border border-transparent hover:border-white"
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
          className="border border-transparent hover:border-white"
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
          catalogName="Popular This Week"
          url="https://letterboxd.com/films/popular/this/week/"
          posterChoice="cinemeta"
        />
        <List
          catalogName="Popular This Month"
          url="https://letterboxd.com/films/popular/this/month/"
          posterChoice="cinemeta"
        />
      </div>
    </div>
  );
}
