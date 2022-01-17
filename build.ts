import * as path from "path";
import * as esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";
import { dtsPlugin } from "esbuild-plugin-d.ts";

const outdir = "dist";
const outbase = "src";

esbuild.build({
  bundle: true,
  outdir,
  outbase,
  tsconfig: 'tsconfig.json',
  platform: "node",
  metafile: false,
  treeShaking: true,
  external: [
    "esbuild",
  ],
  plugins: [
    nodeExternalsPlugin({
      packagePath: 'package.json',
    }),
    dtsPlugin(),
  ],
  entryPoints: {
    "index": path.join("src", "index.ts"),
  }
});
