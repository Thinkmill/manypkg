import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export const SinglePackageTool: Tool = {
    type: 'package',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        // The single package tool is never the root of a monorepo.
        return false;
    },

    isMonorepoRootSync(directory: string): boolean {
        // The single package tool is never the root of a monorepo.
        return false;
    },

    async getPackages(directory: string): Promise<Packages> {
        try {
            const pkgJson: PackageJSON = (await fs.readJson(path.join(directory, "package.json")));
            const pkg: Package = {
                dir: directory,
                packageJson: pkgJson
            };

            return {
                tool: SinglePackageTool,
                packages: [pkg],
                root: pkg
            };
        } catch (err: any) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${SinglePackageTool.type} monorepo root`);
        }
    },

    getPackagesSync(directory: string): Packages {
        try {
            const pkgJson: PackageJSON = fs.readJsonSync(path.join(directory, "package.json"));
            const pkg: Package = {
                dir: directory,
                packageJson: pkgJson
            };

            return {
                tool: SinglePackageTool,
                packages: [pkg],
                root: pkg
            };
        } catch (err: any) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${SinglePackageTool.type} monorepo root`);
        }
    }
}