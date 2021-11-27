import { writeFile } from "fs";
import * as path from "path";
import { importModule, scanFiles } from "src/scan";
import { generateSwagger } from "src/swagger";
import { promisify } from "util";


const test = async () => {
  const modules = [];

  for await (const { path: p } of scanFiles(path.join(__dirname, "service"))) {
    console.log(p);
    const module = await importModule(p);
    module !== null && modules.push(module);
  }

  const doc = generateSwagger(modules);
  await promisify(writeFile)("./openapi.yml", JSON.stringify(doc, null, 2));
};


test();
