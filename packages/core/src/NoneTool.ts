import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export const NoneTool : Tool = {
    type: 'none',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        try {
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;
            return true;
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        return false;
    },

    async getPackages(directory: string): Promise<Packages> {
        try {
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;

            return {
                tool: NoneTool,
                packages: [],
                root: {
                    dir: directory,
                    packageJson: pkgJson
                }
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${NoneTool.type} monorepo root`);
        }
    }
}
