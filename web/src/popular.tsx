import { Toaster, toast } from "react-hot-toast";

function List({ id, name, url }: { id: string; name: string; url: string }) {
  function installList() {
    window.location.href = installUrl;
  }

  const base = window.location.origin.includes(":4321")
    ? "http://localhost:3030"
    : window.location.origin;

  const installUrl = `${base}/${encodeURIComponent(id)}/manifest.json`.replace(
    /https?/,
    "stremio",
  );

  return (
    <div className="grid gap-2 grid-cols-2">
      <div className="text-right">
        <a href={url} className="italic hover:underline">
          {name}
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
          id="/films/popular/this/week/|cn=Popular This Week"
          name="Weekly"
          url="https://letterboxd.com/films/popular/this/week/"
        />
        <List
          id="/films/popular/this/month/|cn=Popular This Month"
          name="Monthly"
          url="https://letterboxd.com/films/popular/this/monthly/"
        />
      </div>
    </div>
  );
}
