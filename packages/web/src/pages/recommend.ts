import { serverEnv, HOST_LOCAL } from "@stremio-addon/env";
import type { APIContext } from "astro";

// opt-out of prerendering for this page
export const prerender = false;

// ? This redirects the request to the local server if in development mode.
export function GET({ redirect, request }: APIContext) {
  if (serverEnv.isDevelopment) {
    const localUrl = new URL(HOST_LOCAL);
    const url = new URL(request.url);
    url.host = localUrl.host;
    url.protocol = localUrl.protocol;
    return redirect(url.toString());
  }

  return redirect(request.url);
}
