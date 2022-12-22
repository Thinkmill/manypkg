import path from "path";
import readYamlFile, { sync as readYamlFileSync } from "read-yaml-file";
import fs from "fs-extra";

import {
  Tool,
  ToolType,
  Package,
  PackageJSON,
  Packages,
  InvalidMonorepoError,
} from "./Tool";
import {
  expandPackageGlobs,
  expandPackageGlobsSync,
} from "./expandPackageGlobs";

export interface PnpmWorkspaceYaml {
  packages?: string[];
}

export const PnpmTool: Tool = {
  type: "pnpm",

  async isMonorepoRoot(directory: string): Promise<boolean> {
    try {
      const manifest = await readYamlFile<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );

      if (manifest.packages) {
        return true;
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
    return false;
  },

  isMonorepoRootSync(directory: string): boolean {
    try {
      const manifest = readYamlFileSync<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );

      if (manifest.packages) {
        return true;
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
    return false;
  },

  async getPackages(directory: string): Promise<Packages> {
    const rootDir = path.resolve(directory);

    try {
      const manifest = await readYamlFile<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );
      const pkgJson = (await fs.readJson(
        path.join(directory, "package.json")
      )) as PackageJSON;
      const packageGlobs: string[] = manifest.packages!;

      return {
        tool: PnpmTool,
        packages: await expandPackageGlobs(packageGlobs, directory),
        rootPackage: {
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir: rootDir,
      };
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`
      );
    }
  },

  getPackagesSync(directory: string): Packages {
    const rootDir = path.resolve(directory);

    try {
      const manifest = readYamlFileSync<{ packages?: string[] }>(
        path.join(directory, "pnpm-workspace.yaml")
      );
      const pkgJson = fs.readJsonSync(
        path.join(directory, "package.json")
      ) as PackageJSON;
      const packageGlobs: string[] = manifest.packages!;

      return {
        tool: PnpmTool,
        packages: expandPackageGlobsSync(packageGlobs, directory),
        rootPackage: {
          relativeDir: ".",
          packageJson: pkgJson,
        },
        rootDir: rootDir,
      };
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
      throw new InvalidMonorepoError(
        `Directory ${directory} is not a valid ${PnpmTool.type} monorepo root: missing pnpm-workspace.yaml and/or package.json`
      );
    }
  },
};
