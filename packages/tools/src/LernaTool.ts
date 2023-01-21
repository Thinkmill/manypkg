import path from "path";
import fs from "fs-extra";

import {
  Tool,
  Package,
  PackageJSON,
  Packages,
  InvalidMonorepoError,
} from "./Tool";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs";

export interface LernaJson {
  useWorkspaces?: boolean;
  packages?: string[];
}

export const LernaTool: Tool = {
  type: "lerna",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const lernaJson = (await fs.readJson(
        path.join(directory, "lerna.json")
      )) as LernaJson;
      if (lernaJson.useWorkspaces !== true) {
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
      const lernaJson = fs.readJsonSync(
        path.join(directory, "lerna.json")
      ) as LernaJson;
      if (lernaJson.useWorkspaces !== true) {
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
      const lernaJson = await fs.readJson(path.join(rootDir, "lerna.json"));
      const pkgJson = (await fs.readJson(
        path.join(rootDir, "package.json")
      )) as PackageJSON;
      const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

      return {
        tool: LernaTool,
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
          `Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`
        );
      }
      throw err;
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const lernaJson = fs.readJsonSync(
        path.join(rootDir, "lerna.json")
      ) as LernaJson;
      const pkgJson = fs.readJsonSync(
        path.join(rootDir, "package.json")
      ) as PackageJSON;
      const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

      return {
        tool: LernaTool,
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
          `Directory ${rootDir} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`
        );
      }
      throw err;
    }
  },
};
