import * as path from "node:path";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import { F_OK } from "node:constants";

import {
  type Tool,
  type PackageJSON,
  type Packages,
  InvalidMonorepoError,
} from "./Tool.ts";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs.ts";
import { readJson, readJsonSync } from "./utils.ts";

interface NubPackageJSON extends PackageJSON {
  workspaces?:
    | string[]
    | { packages: string[]; catalog?: Record<string, string> };
}

async function hasNubLockFile(directory: string): Promise<boolean> {
  try {
    await fsp.access(path.join(directory, "nub.lock"), F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function hasNubLockFileSync(directory: string): boolean {
  try {
    fs.accessSync(path.join(directory, "nub.lock"), F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export const NubTool: Tool = {
  type: "nub",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const [pkgJson, hasLockFile] = await Promise.all([
        readJson(directory, "package.json") as Promise<NubPackageJSON>,
        hasNubLockFile(directory),
      ]);
      if (pkgJson.workspaces && hasLockFile) {
        if (
          Array.isArray(pkgJson.workspaces) ||
          Array.isArray(pkgJson.workspaces.packages)
        ) {
          return true;
        }
      }
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
    return false;
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      const hasLockFile = hasNubLockFileSync(directory);
      if (!hasLockFile) {
        return false;
      }
      const pkgJson = readJsonSync(directory, "package.json") as NubPackageJSON;
      if (pkgJson.workspaces) {
        if (
          Array.isArray(pkgJson.workspaces) ||
          Array.isArray(pkgJson.workspaces.packages)
        ) {
          return true;
        }
      }
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        return false;
      }
      throw err;
    }
    return false;
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      const pkgJson = (await readJson(
        rootDir,
        "package.json"
      )) as NubPackageJSON;
      const packageGlobs: string[] = Array.isArray(pkgJson.workspaces)
        ? pkgJson.workspaces
        : pkgJson.workspaces?.packages || [];

      return {
        tool: NubTool,
        packages: await expandPackageGlobs(packageGlobs, rootDir),
        rootPackage: {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${NubTool.type} monorepo root`
        );
      }
      throw err;
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const pkgJson = readJsonSync(rootDir, "package.json") as NubPackageJSON;
      const packageGlobs: string[] = Array.isArray(pkgJson.workspaces)
        ? pkgJson.workspaces
        : pkgJson.workspaces?.packages || [];

      return {
        tool: NubTool,
        packages: expandPackageGlobsSync(packageGlobs, rootDir),
        rootPackage: {
          dir: rootDir,
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as { code: string }).code === "ENOENT") {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${NubTool.type} monorepo root`
        );
      }
      throw err;
    }
  },
};
