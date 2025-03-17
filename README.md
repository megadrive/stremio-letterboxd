# Stremio Addon Starter

This is a starter template for creating Stremio Addons using TypeScript, Astro and Express. Hopefully this is a good starting point for your own addon.

## Why use this?

This project leverages some really great packages to ensure smooth development and deployment. It offers a solid starting point for building your own addon, and is easy to extend.

- [pnpm](https://pnpm.io/) for dependency management, which is a great way to ensure that your addon is up-to-date. Also using the workspaces feature.
- [Astro](https://astro.build/) for the frontend. One of my favourite frontends, it allows for you to use any existing knowledge of React, Vue, Svelte, etc. to build your frontend.
- [Express](https://expressjs.com/) for the backend, battle-tested, easy to use, and has a large ecosystem of plugins, if needed.
- [Zod](https://zod.dev/) for type safety, including ensuring any user-provided content is valid and safe. An incredible library.
- [Envalid](https://envalid.dev/) for environment variables, which is a great way to ensure that the addon is configured correctly.

## Getting started

### Prerequisites

- pnpm - https://pnpm.io/installation
- Node.js 22.11.0 or higher

### Installation

1. Navigate to a folder where you want to create the project
2. Run `pnpx tiged github:megadrive/stremio-addon-boilerplate-ts my-new-stremio-addon`
3. Navigate into the folder: `cd my-new-stremio-addon`
4. Install dependencies: `pnpm install`
5. (optional) Initialise git: `git init && git add . && git commit -m "Initial commit"`

### Usage notes

For development: run `pnpm dev` to start the addon in development mode. Navigate to `http://localhost:4321` to see the addon. Any changes will be auto-reloaded. If you change any environment variables, you will need to restart the server.
For production: run `pnpm build` to build the addon, then run the project with `pnpm -w start`. The addon will be available at `http://localhost:3000`.

Note: You may have noticed the ports are different. During development, Astro's dev server runs on port 4321, and the addon server runs on port 3000. When you build the addon and run in prod, the server runs on port 3000.

From the root of the project, run `pnpm install` to install dependencies.

### How it works:

The project is a monorepo, with the following packages, in the "@stremio-addon" namespace:

- `config`: Configuration logic, shared between both packages.
- `env`: Environment variables, only for SSR. I've made this it's own package you can use it in Astro if you wish to use SSR. It is not used in the server by default.
- `web`: Astro, which serves the configure page, plus anything else that is a static asset/page. Pre-configured to use TailwindCSS.
- `server`: ExpressJS, which is the bulk of the addon, plus any other code that is server-side.

`server` serves static files from `web`. There is a `server` folder within `web`'s dist folder, but is only needed for development.

### Important things to note

Read the above "How it works" section first.

#### Config

- `packages/config/src/config.ts` is where you would change how your addon encodes and decodes your configuration. It must be able to be run in the browser. If you want to, you can make it server-only by creating a custom endpoint in `packages/server/src/index.ts` and doing it there.

#### Env

- `packages/env/src/env.ts` is where you would change your environment variables, these are currently only server-side.

#### Web

`packages/web` is where you would change your frontend. It is preconfigured for:

- SSR using `@astrojs/node`
- React using `@astrojs/react`
- Tailwind, configured with Vite [following these instructions](https://docs.astro.build/en/guides/styling/#tailwind)

`packages/web/public` are the static assets - generally images, fonts, etc. - that will be used in the frontend and available publically. `logo.png` lives here. Note that the logo - defined in `server/src/routes/manifest.ts` must be an absolute URL and doesn't work

`packages/web/src/layouts/Layout.astro` is the main layout that surrounds the `configure.astro`

`packages/web/src/pages/configure.astro` becomes `/configure`. The &lt;h1&gt; is in this file.

`packages/web/src/pages/[config]` should be left alone and is only used in development. During dev, these proxy to the addon server, that is running on port 3000 (by default). When building for production, it builds to `dist/server` but can be safely ignored.

`packages/web/src/component/ConfigureForm.tsx`

This handles the default form. You can edit this as you wish. You can use ANY frontend framework (even plain HTML) by following the Astro docs on [Integrations](https://docs.astro.build/en/guides/integrations-guide/). I've used `react-hook-form` to validate the form.

**Note:** In Astro, it has the concepts of "islands". You can read more about them [here](https://docs.astro.build/en/guides/islands/). When added a JavaScript-enabled element, make sure to add a client directive like `client:load` to the element, this will signal to Astro that it should load the interactivity. Example:

```astro
<ConfigureForm client:load />
```

#### Server

This is the "logic" of your addon. [Please read up on the way Stremio addons work before you start](https://github.com/Stremio/stremio-addon-sdk/).

`packages/server/src/routes/*` are the endpoints that Stremio will query. Your addon logic and what it will return will live in each of these files.

Stremio will only query the resources and types you specify in the manifest.

## Known issues

- `server`: `res.locals` is not typed. Need to figure out how to type it based on `packages/config/src/config.ts:Config`
