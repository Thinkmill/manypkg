import path from "node:path";
import { glob, globSync } from "tinyglobby";

import type { Package, DenoJSON, Tool } from "./Tool.ts";

const dependencyRegexp =
  /^(?<protocol>jsr:|npm:|https:|http:)\/?(?<name>@?[^@\s]+)@?(?<version>[^\s/]+)?\/?/;

function extractDependencies(json: DenoJSON): Package["dependencies"] {
  const dependencies: Package["dependencies"] = {};
  if (!json.imports) {
    return dependencies;
  }
  for (const [alias, specifier] of Object.entries(json.imports)) {
    const match = specifier.match(dependencyRegexp);
    if (match?.groups) {
      const { name, version } = match.groups;
      dependencies[alias] = {
        name,
        version,
      };
    }
  }
  return dependencies;
}
import {
  findDenoConfig,
  findDenoConfigSync,
  readJsonc,
  readJsoncSync,
} from "./utils.ts";

async function getDenoPackageFromDir(
  packageDir: string,
  rootDir: string,
  tool: Tool
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
      const dependencies = extractDependencies(denoJson);
      return {
        dir: fullPath,
        relativeDir,
        packageJson: denoJson,
        tool,
        dependencies,
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
  rootDir: string,
  tool: Tool
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
      const dependencies = extractDependencies(denoJson);
      return {
        dir: fullPath,
        relativeDir,
        packageJson: denoJson,
        tool,
        dependencies,
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
  directory: string,
  tool: Tool
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
    directories.map((dir) => getDenoPackageFromDir(dir, directory, tool))
  );

  return discoveredPackages.filter((pkg) => pkg) as Package[];
}

/**
 * A synchronous version of {@link expandDenoPackagesGlobs}.
 */
export function expandDenoGlobsSync(
  packageGlobs: string[],
  directory: string,
  tool: Tool
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
    (dir) => getDenoPackageFromDirSync(dir, directory, tool)
  );

  return discoveredPackages.filter((pkg) => pkg) as Package[];
}
