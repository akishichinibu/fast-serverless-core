import * as esbuild from "esbuild";
import { ClzType } from "src/type";

export type InputInfo = esbuild.Metafile["inputs"][string];

export async function getDependecyGraph(metafile: esbuild.Metafile) {
  const obj: Array<[string, InputInfo]> = Object.entries(metafile.inputs)
    .map(([k, v]) => ({
      importPath: k,
      info: v,
    }))
    .map(({ importPath, info }) => [importPath, info]);
  return new Map(obj);
}

export async function getAllDependeciesFromGraph(entry: string, graph: Map<string, InputInfo>) {
  const deque: Array<string> = [entry,];
  const dependecies = new Set<string>([entry,]);

  while (deque.length > 0) {
    const head = deque.shift()!;
    for (const child of (graph.get(head)?.imports ?? [])) {
      dependecies.add(child.path);
    }
  }

  return dependecies;
}

export async function importAsController(modulePath: string) {
  const module = await import(modulePath);
  const Controller = module['default'] as ClzType<any>;
  return Controller;
}
