import * as path from "path";
import { Generator } from "npm-dts";
import * as esbuild from "esbuild";
import { nodeExternalsPlugin } from "esbuild-node-externals";

const outputDir = "dist";

const commonSettings: esbuild.BuildOptions = {
  bundle: true,
  outdir: "dist",
  tsconfig: 'tsconfig.json',
  platform: "node",
  metafile: false,
  external: [
    "esbuild",
  ],
  plugins: [
    nodeExternalsPlugin({
      packagePath: 'package.json',
    }),
  ],
}

esbuild.build({
  ...commonSettings,
  entryPoints: {
    "index": path.join("src", "index.ts"),
    "cli": path.join("cli", "index.ts"),
  }
});

new Generator({
  entry: path.join("src", "index.ts"),
  output: 'dist/index.d.ts',
  // @ts-ignore
  logLevel: "debug",
}, true).generate()
