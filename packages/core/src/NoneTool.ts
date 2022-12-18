import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs } from "./expandPackageGlobs";

export const NoneTool : Tool = {
    type: 'none',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        try {
            const pkgJson: PackageJSON = (await fs.readJson(path.join(directory, "package.json")));
            return true;
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        return false;
    },

    isMonorepoRootSync(directory: string): boolean {
        try {
            const pkgJson: PackageJSON = fs.readJsonSync(path.join(directory, "package.json"));
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
            const pkgJson: PackageJSON = (await fs.readJson(path.join(directory, "package.json")));
            const pkg: Package = {
                dir: directory,
                packageJson: pkgJson
            };

            return {
                tool: NoneTool,
                packages: [pkg],
                root: pkg
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${NoneTool.type} monorepo root`);
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
                tool: NoneTool,
                packages: [pkg],
                root: pkg
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${NoneTool.type} monorepo root`);
        }
    }
}
