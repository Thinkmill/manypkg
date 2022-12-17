import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export interface YarnPackageJSON extends PackageJSON {
    workspaces?: string[] | { packages: string[] };
}

export const YarnTool : Tool = {
    type: 'yarn',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        try {
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as YarnPackageJSON;
            if (pkgJson.workspaces) {
                if (Array.isArray(pkgJson.workspaces) || Array.isArray(pkgJson.workspaces.packages)) {
                    return true;
                }
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
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as YarnPackageJSON;
            const packageGlobs: string[] = Array.isArray(pkgJson.workspaces) ? pkgJson.workspaces : pkgJson.workspaces!.packages;

            return {
                tool: YarnTool,
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
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${BoltTool.type} monorepo root`);
        }
    }
}
