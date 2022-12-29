import path from "path";
import fs from "fs-extra";

import { Tool, PackageJSON, Packages, InvalidMonorepoError } from "./Tool";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs";

export interface YarnPackageJSON extends PackageJSON {
  workspaces?: string[] | { packages: string[] };
}

export const YarnTool = {
  type: "yarn" as const,

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const pkgJson = (await fs.readJson(
        path.join(directory, "package.json")
      )) as YarnPackageJSON;
      if (pkgJson.workspaces) {
        if (
          Array.isArray(pkgJson.workspaces) ||
          Array.isArray(pkgJson.workspaces.packages)
        ) {
          return true;
        }
      }
    } catch (err) {
      if (err && (err as any).code !== "ENOENT") {
        throw err;
      }
    }
    return false;
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      const pkgJson = fs.readJsonSync(
        path.join(directory, "package.json")
      ) as YarnPackageJSON;
      if (pkgJson.workspaces) {
        if (
          Array.isArray(pkgJson.workspaces) ||
          Array.isArray(pkgJson.workspaces.packages)
        ) {
          return true;
        }
      }
    } catch (err) {
      if (err && (err as any).code !== "ENOENT") {
        throw err;
      }
    }
    return false;
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      const pkgJson = (await fs.readJson(
        path.join(directory, "package.json")
      )) as YarnPackageJSON;
      const packageGlobs: string[] = Array.isArray(pkgJson.workspaces)
        ? pkgJson.workspaces
        : pkgJson.workspaces!.packages;

      return {
        tool: YarnTool,
        packages: await expandPackageGlobs(packageGlobs, directory),
        rootPackage: {
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as any).code !== "ENOENT") {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${YarnTool.type} monorepo root`
      );
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const pkgJson = fs.readJsonSync(
        path.join(directory, "package.json")
      ) as YarnPackageJSON;
      const packageGlobs: string[] = Array.isArray(pkgJson.workspaces)
        ? pkgJson.workspaces
        : pkgJson.workspaces!.packages;

      return {
        tool: YarnTool,
        packages: expandPackageGlobsSync(packageGlobs, directory),
        rootPackage: {
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir,
      };
    } catch (err) {
      if (err && (err as any).code !== "ENOENT") {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${YarnTool.type} monorepo root`
      );
    }
  },
} satisfies Tool;
