import path from "node:path";
import fsp from "node:fs/promises";
import { glob, globSync } from "tinyglobby";

import type { Package, PackageJSON, Tool } from "./Tool.ts";
import { readJsonSync } from "./utils.ts";

/**
 * This internal method takes a list of one or more directory globs and the absolute path
 * to the root directory, and returns a list of all matching relative directories that
 * contain a `package.json` file.
 */
export async function expandPackageGlobs(
  packageGlobs: string[],
  directory: string,
  tool: Tool
): Promise<Package<PackageJSON>[]> {
  const relativeDirectories: string[] = await glob(packageGlobs, {
    cwd: directory,
    onlyDirectories: true,
    ignore: ["**/node_modules"],
    expandDirectories: false,
  });
  const directories = relativeDirectories
    .map((p) => path.resolve(directory, p))
    .sort();

  const discoveredPackages: Array<Package<PackageJSON> | undefined> =
    await Promise.all(
      directories.map((dir) =>
        fsp
          .readFile(path.join(dir, "package.json"), "utf-8")
          .catch((err) => {
            if (err && (err as { code: string }).code === "ENOENT") {
              return undefined;
            }
            throw err;
          })
          .then((result) => {
            if (result) {
              return {
                dir: path.resolve(dir),
                relativeDir: path.relative(directory, dir),
                packageJson: JSON.parse(result),
                tool,
              };
            }
          })
      )
    );

  return discoveredPackages.filter((pkg) => pkg) as Package<PackageJSON>[];
}

/**
 * A synchronous version of {@link expandPackagesGlobs}.
 */
export function expandPackageGlobsSync(
  packageGlobs: string[],
  directory: string,
  tool: Tool
): Package<PackageJSON>[] {
  const relativeDirectories: string[] = globSync(packageGlobs, {
    cwd: directory,
    onlyDirectories: true,
    ignore: ["**/node_modules"],
    expandDirectories: false,
  });
  const directories = relativeDirectories
    .map((p) => path.resolve(directory, p))
    .sort();

  const discoveredPackages: Array<Package<PackageJSON> | undefined> =
    directories.map((dir) => {
      try {
        const packageJson: PackageJSON = readJsonSync(dir, "package.json");
        return {
          dir: path.resolve(dir),
          relativeDir: path.relative(directory, dir),
          packageJson,
          tool,
        };
      } catch (err) {
        if (err && (err as { code: string }).code === "ENOENT") {
          return undefined;
        }
        throw err;
      }
    });

  return discoveredPackages.filter((pkg) => pkg) as Package<PackageJSON>[];
}
