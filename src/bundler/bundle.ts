import * as path from "path";
import * as fs from "fs";

import * as esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

import { promisify } from "util";
import { scanFiles } from "src/bundler/scan";

const generateLoader = (importPath: string) => `
import Controller from "${importPath}";
import { AWSHandlerAdapter as Adapter } from "fast-serverless-restful/";

const c = new Controller();
const adapter = new Adapter();

export const handler = adapter.adapt("get", c);
`;

const fileNameWithoutExt = (p: string) => path.basename(p, path.extname(p));

const readPackageJson = async (root: string) => {
  const fn = path.join(root, "package.json");
  const content = await promisify(fs.readFile)(fn);
  return JSON.parse(content.toString());
}

const readProjectName = async (root: string) => {
  return (await readPackageJson(root))["name"];
}

interface BundleOptions {
  watch?: boolean;
}

export async function bundleProject(root: string, bundleOptions?: BundleOptions) {
  const outputDir = path.join(root, ".fast");
  const bundleTempDir = path.join(outputDir, '.cache');
  await promisify(fs.mkdir)(bundleTempDir, { recursive: true });

  const entryPoints: Record<string, string> = {};

  for await (const { path: fullPath } of scanFiles(path.join(root, "service"))) {
    const entryFn = fileNameWithoutExt(fullPath);
    const loaderPath = path.join(bundleTempDir, `entry.${entryFn}.ts`);
    const loaderContent = generateLoader(path.relative(bundleTempDir, fullPath));
    await promisify(fs.writeFile)(loaderPath, loaderContent);
    entryPoints[entryFn] = loaderPath;
  }

  const outdir = path.join(outputDir, await readProjectName(root));

  const options: esbuild.BuildOptions = {
    absWorkingDir: root,
    bundle: true,
    entryPoints,
    outdir,
    tsconfig: path.join(root, 'tsconfig.json'),
    platform: "node",
    metafile: true,
    plugins: [
      nodeExternalsPlugin({
        packagePath: path.join(root, 'package.json'),
      }),
    ],
    incremental: bundleOptions?.watch ?? false,
    watch: {
      onRebuild: (error, result) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Rebuild success!`, JSON.stringify(result?.metafile));
        }
      }
    }
  }

  const buildResult = await esbuild.build(options);
  return buildResult;
}
