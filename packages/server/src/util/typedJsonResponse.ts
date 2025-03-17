import type { Response } from "express";
export type { Request } from "express";

/**
 * ? This is a helper type for Express responses that allows you to return
 * ? a JSON response which is type-checked by TypeScript to ensure you are returning correct data.
 */

type Send<ResBody = unknown, T = Response<ResBody>> = (body?: ResBody) => T;
export interface TypedJsonResponse<T> extends Response<T> {
  json: Send<T, this>;
}
