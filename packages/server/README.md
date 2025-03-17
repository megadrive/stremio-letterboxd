# Server

This is where the server-side of the addon lives. Whenever Stremio queries your addon, it will be handled by this package.

## Usage

The crux of this package is in `/routes`.

Within `/routes/`, there is a file for each resource type. Modify the function within these files to do what you want your app to do. Stremio hits these endpoints when the user requests a resource of that type, for instance a catalog.

`/routes/manifest.ts` is where you configure your manifest. This is where you set your "constant" settings, aka your "id", "name", and "version". Possibly a description! In many addons, "types" and "resources" and "catalogs" get modified after being configured.

Note that a config part of the URL is optional when querying the manifest, as
