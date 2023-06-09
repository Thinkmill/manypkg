import path from "path";
import fs from "fs-extra";

import { Tool, PackageJSON, Packages, InvalidMonorepoError } from "./Tool";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs";

export interface BoltPackageJSON extends PackageJSON {
  bolt?: {
    workspaces?: string[];
  };
}

export const BoltTool: Tool = {
  type: "bolt",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const pkgJson = (await fs.readJson(
        path.join(directory, "package.json")
      )) as BoltPackageJSON;
      if (pkgJson.bolt && pkgJson.bolt.workspaces) {
        return true;
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
      const pkgJson = fs.readJsonSync(
        path.join(directory, "package.json")
      ) as BoltPackageJSON;
      if (pkgJson.bolt && pkgJson.bolt.workspaces) {
        return true;
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
      const pkgJson = (await fs.readJson(
        path.join(rootDir, "package.json")
      )) as BoltPackageJSON;
      if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
        throw new InvalidMonorepoError(
          `Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`
        );
      }
      const packageGlobs: string[] = pkgJson.bolt.workspaces;

      return {
        tool: BoltTool,
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
          `Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`
        );
      }
      throw err;
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const pkgJson = fs.readJsonSync(
        path.join(rootDir, "package.json")
      ) as BoltPackageJSON;
      if (!pkgJson.bolt || !pkgJson.bolt.workspaces) {
        throw new InvalidMonorepoError(
          `Directory ${directory} is not a valid ${BoltTool.type} monorepo root: missing bolt.workspaces entry`
        );
      }
      const packageGlobs: string[] = pkgJson.bolt.workspaces;

      return {
        tool: BoltTool,
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
          `Directory ${rootDir} is not a valid ${BoltTool.type} monorepo root: missing package.json`
        );
      }
      throw err;
    }
  },
};
