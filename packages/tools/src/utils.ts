import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export const readJson = async (directory: string, file: string) => JSON.parse((await fsp.readFile(
    path.join(directory, file)
  )).toString());

export const readJsonSync = (directory: string, file: string) => JSON.parse(fs.readFileSync(
    path.join(directory, file)
  ).toString());
