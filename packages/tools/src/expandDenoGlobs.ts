import path from "node:path";
import { glob, globSync } from "tinyglobby";

import type { Package, DenoJSON } from "./Tool.ts";
import {
  findDenoConfig,
  findDenoConfigSync,
  readJsonc,
  readJsoncSync,
} from "./utils.ts";

async function getDenoPackageFromDir(
  packageDir: string,
  rootDir: string
): Promise<Package | undefined> {
  const fullPath = path.resolve(rootDir, packageDir);
  const relativeDir = path.relative(rootDir, fullPath);

  try {
    const fileName = await findDenoConfig(fullPath);
    if (!fileName) {
      return undefined;
    }

    const denoJson = (await readJsonc(fullPath, fileName)) as DenoJSON;

    if (denoJson.name && denoJson.version) {
      return {
        dir: fullPath,
        relativeDir,
        packageJson: denoJson,
      };
    }
    return undefined;
  } catch (err) {
    if (err && (err as { code: string }).code === "ENOENT") {
      return undefined;
    }
    throw err;
  }
}

function getDenoPackageFromDirSync(
  packageDir: string,
  rootDir: string
): Package | undefined {
  const fullPath = path.resolve(rootDir, packageDir);
  const relativeDir = path.relative(rootDir, fullPath);

  try {
    const fileName = findDenoConfigSync(fullPath);
    if (!fileName) {
      return undefined;
    }

    const denoJson = readJsoncSync(fullPath, fileName) as DenoJSON;

    if (denoJson.name && denoJson.version) {
      return {
        dir: fullPath,
        relativeDir,
        packageJson: denoJson,
      };
    }
    return undefined;
  } catch (err) {
    if (err && (err as { code: string }).code === "ENOENT") {
      return undefined;
    }
    throw err;
  }
}

/**
 * This internal method takes a list of one or more directory globs and the absolute path
 * to the root directory, and returns a list of all matching relative directories that
 * contain a `deno.json` or `deno.jsonc` file.
 */
export async function expandDenoGlobs(
  packageGlobs: string[],
  directory: string
): Promise<Package[]> {
  const relativeDirectories: string[] = await glob(packageGlobs, {
    cwd: directory,
    onlyDirectories: true,
    ignore: ["**/node_modules"],
    expandDirectories: false,
  });
  const directories = relativeDirectories
    .map((p) => path.resolve(directory, p))
    .sort();

  const discoveredPackages: Array<Package | undefined> = await Promise.all(
    directories.map((dir) => getDenoPackageFromDir(dir, directory))
  );

  return discoveredPackages.filter((pkg) => pkg) as Package[];
}

/**
 * A synchronous version of {@link expandDenoPackagesGlobs}.
 */
export function expandDenoGlobsSync(
  packageGlobs: string[],
  directory: string
): Package[] {
  const relativeDirectories: string[] = globSync(packageGlobs, {
    cwd: directory,
    onlyDirectories: true,
    ignore: ["**/node_modules"],
    expandDirectories: false,
  });
  const directories = relativeDirectories
    .map((p) => path.resolve(directory, p))
    .sort();

  const discoveredPackages: Array<Package | undefined> = directories.map(
    (dir) => getDenoPackageFromDirSync(dir, directory)
  );

  return discoveredPackages.filter((pkg) => pkg) as Package[];
}
