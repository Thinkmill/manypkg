import findUp from "find-up";
import path from "path";
import fs from "fs-extra";

export class NoPkgJsonFound extends Error {
  directory: string;
  constructor(directory: string) {
    super(
      `No package.json could be found upwards from the directory ${directory}`
    );
    this.directory = directory;
  }
}

export default async function findWorkspacesRoot(cwd: string): Promise<string> {
  let firstPkgJsonDirectory: string | undefined;
  let dir = await findUp(
    async directory => {
      try {
        let pkgJson = await fs.readJson(path.join(directory, "package.json"));
        if (firstPkgJsonDirectory === undefined) {
          firstPkgJsonDirectory = directory;
        }
        if (pkgJson.workspaces || pkgJson.bolt) {
          return directory;
        }
      } catch (err) {
        if (err.code !== "ENOENT") {
          throw err;
        }
      }
    },
    { cwd, type: "directory" }
  );
  if (firstPkgJsonDirectory === undefined) {
    throw new NoPkgJsonFound(cwd);
  }
  if (dir === undefined) {
    return firstPkgJsonDirectory;
  }
  return dir;
}
