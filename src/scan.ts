import * as path from 'path';
import * as fs from 'fs';
import { EndpointModule } from './decorators';

const JSON_RESPONSE_CONTENT_TYPE = 'application/json';
const endpointFileSubffix = '.ts';

async function* walk(dir: string): AsyncGenerator<string> {
  const currentDir = await fs.promises.opendir(dir);
  for await (const p of currentDir) {
    const entry = path.join(dir, p.name);
    if (p.isDirectory()) {
      yield* walk(entry);
    } else if (p.isFile() && p.name.endsWith(endpointFileSubffix)) {
      yield entry;
    }
  }
}

export async function* scanFiles(basePath: string) {
  for await (const p of walk(basePath)) {
    const relativePath = path.relative(basePath, p);
    const filename = path.basename(p, endpointFileSubffix);

    yield {
      path: p,
      relativePath,
      filename
    };
  }
}

export async function importModule(modulePath: string) {
  const module = await import(modulePath);
  const m = 'default' in module ? module['default'] : module;
  console.log('@@@3', m);
  // const instance = m["_"];

  // if (instance === undefined) {
  //   console.warn(`Imported from ${modulePath}, but it doesn't contain an endpoint export, skipped. `);
  //   return null;
  // }

  return m as EndpointModule;
}
