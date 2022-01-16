import { Readable } from "stream";

export async function profiling<T>(f: (...args: any[]) => T | Promise<T>, args: any[]): Promise<[number, T]> {
  const t0 = new Date().getTime();
  const r = await f(...args);
  const cost = new Date().getTime() - t0;

  return [cost, r];
}

export const endpointUrlPartRegex = /\w*(?<params>(?:\{\w+\})*)/;
export const endpointBaseUrlRegex = /\/\w+/;
