import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { glob, globSync } from "tinyglobby";

import type { Package, PackageJSON } from "./Tool.ts";
import { readJsonc, readJsoncSync } from "./utils.ts";

async function getDenoPackageFromDir(
  packageDir: string,
  rootDir: string
): Promise<Package | undefined> {
  const fullPath = path.resolve(rootDir, packageDir);
  const relativeDir = path.relative(rootDir, fullPath);

  try {
    let fileName: string | undefined;
    try {
      if ((await fsp.stat(path.join(fullPath, "deno.json"))).isFile()) {
        fileName = "deno.json";
      }
    } catch (err) {
      if (err && (err as { code: string }).code !== "ENOENT") {
        throw err;
      }
    }

    if (!fileName) {
      try {
        if ((await fsp.stat(path.join(fullPath, "deno.jsonc"))).isFile()) {
          fileName = "deno.jsonc";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }
    }

    if (!fileName) return undefined;

    const packageJson = (await readJsonc(fullPath, fileName)) as PackageJSON;

    if (packageJson.name && packageJson.version) {
      return {
        dir: fullPath,
        relativeDir,
        packageJson,
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
    let fileName: string | undefined;
    try {
      if (fs.statSync(path.join(fullPath, "deno.json")).isFile()) {
        fileName = "deno.json";
      }
    } catch (err) {
      if (err && (err as { code: string }).code !== "ENOENT") {
        throw err;
      }
    }

    if (!fileName) {
      try {
        if (fs.statSync(path.join(fullPath, "deno.jsonc")).isFile()) {
          fileName = "deno.jsonc";
        }
      } catch (err) {
        if (err && (err as { code: string }).code !== "ENOENT") {
          throw err;
        }
      }
    }

    if (!fileName) return undefined;

    const packageJson = readJsoncSync(fullPath, fileName) as PackageJSON;

    if (packageJson.name && packageJson.version) {
      return {
        dir: fullPath,
        relativeDir,
        packageJson,
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
export async function expandDenoPackageGlobs(
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
export function expandDenoPackageGlobsSync(
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

  const discoveredPackages: Array<Package | undefined> = directories.map((dir) =>
    getDenoPackageFromDirSync(dir, directory)
  );

  return discoveredPackages.filter((pkg) => pkg) as Package[];
}
