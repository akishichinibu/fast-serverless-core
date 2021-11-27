import * as path from "path";
import * as fs from "fs";


const JSON_RESPONSE_CONTENT_TYPE = "application/json";
const ENDPOINT_FILE_SUBFFIX = ".ts";


async function* walk(dir: string): AsyncGenerator<string> {
  const currentDir = await fs.promises.opendir(dir);
  for await (const p of currentDir) {
    const entry = path.join(dir, p.name);
    if (p.isDirectory()) yield* walk(entry);
    else if (p.isFile() && p.name.endsWith(ENDPOINT_FILE_SUBFFIX)) yield entry;
  }
}


export async function* scanFiles(basePath: string) {
  for await (const p of walk(basePath)) {
    const relative = path.relative(basePath, p);

    yield {
      path: p,
      relativePath: relative,
    }
  }
}


export async function importModule(import_: string) {
  const module = await import(import_);
  const m = "default" in module ? module["default"] : module;
  const instance = m["_"];

  if (instance === undefined) {
    console.warn(`Imported from ${import_}, but it doesn't contain an endpoint export, skipped. `);
    return null;
  }

  return m;
}
