import { Toaster, toast } from "react-hot-toast";
import { config, type Config } from "@stremio-addon/config";
import React from "react";

function List(conf: Config) {
  const [installUrl, setInstallUrl] = React.useState<string>("");

  React.useEffect(() => {
    config.encode(conf).then((encoded) => {
      const url = new URL(window.location.href);
      const newOrigin = url.origin.replace(/^https/, "stremio");
      setInstallUrl(`${newOrigin}/${encoded}/manifest.json`);
    });
  }, [config]);

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
      <div className="grid grid-flow-col grid-cols-2 gap-1">
        <button
          className="border border-white rounded hover:bg-white hover:text-[#"
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
          origin={location.origin}
          catalogName="Popular This Week"
          url="https://letterboxd.com/films/popular/this/week/"
          posterChoice="letterboxd"
        />
        <List
          origin={location.origin}
          catalogName="Popular This Month"
          url="https://letterboxd.com/films/popular/this/month/"
          posterChoice="letterboxd"
        />
      </div>
    </div>
  );
}
