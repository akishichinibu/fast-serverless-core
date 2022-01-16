import chalk from 'chalk';

import { bundleProject } from "src/bundler/bundle";
import Y from "./init";

Y.command(
  'build [path]', 'build the project',

  (y) =>
    y
      .positional('path', {
        type: "string",
        describe: 'The project path',
        default: process.cwd(),
      }),

  async (argv) => {
    const root = argv.path;
    console.log(chalk.blueBright(`Starting to bundle the project in [${root}]`));
    await bundleProject(root);
    console.log(chalk.redBright(`done!`));
  }
)
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  });
