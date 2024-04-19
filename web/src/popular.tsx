function List({ id, name, url }: { id: string; name: string; url: string }) {
  const installUrl = `stremio://${
    new URL(window.location.href).host
  }/${id}/manifest.json`;
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
          onClick={() => (window.location.href = installUrl)}
        >
          Install
        </button>
        <button
          className="border border-transparent hover:border-white"
          onClick={() =>
            navigator.clipboard
              .writeText(installUrl)
              .then(() => alert("Copied!"))
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
      <h2 className="text-center font-semibold text-xl mb-2">
        Popular lists
        <br />
        <div className="text-sm">(first page only)</div>
      </h2>
      <div className="grid gap-1">
        <List
          id="_internal_|weekly"
          name="Weekly"
          url="https://letterboxd.com/films/popular/this/week/"
        />
        <List
          id="_internal_|monthly"
          name="Monthly"
          url="https://letterboxd.com/films/popular/this/monthly/"
        />
      </div>
    </div>
  );
}
