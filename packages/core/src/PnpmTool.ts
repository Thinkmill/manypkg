import path from 'path';
import readYamlFile, { sync as readYamlFileSync } from "read-yaml-file";
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export interface PnpmWorkspaceYaml {
    packages?: string[]
}

export const PnpmTool: Tool = {
    type: 'pnpm',

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

    async getPackages(directory: string): Promise<Packages> {
        try {
            const manifest = await readYamlFile<{ packages?: string[] }>(
                path.join(directory, "pnpm-workspace.yaml")
            );
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;
            const packageGlobs: string[] = manifest.packages!;

            return {
                tool: PnpmTool,
                packages: await expandPackageGlobs(packageGlobs, directory),
                root: {
                    dir: directory,
                    packageJson: pkgJson
                }
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${PnpmTool.type} monorepo root`);
        }
    }
}
