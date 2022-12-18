import path from 'path';
import fs from 'fs-extra';

import { Tool, ToolType, Package, PackageJSON, Packages, InvalidMonorepoError } from './Tool';
import { expandPackageGlobs, expandPackageGlobsSync } from "./expandPackageGlobs";

export interface LernaJson {
    useWorkspaces?: boolean;
    packages?: string[];
}

export const LernaTool: Tool = {
    type: 'lerna',

    async isMonorepoRoot(directory: string): Promise<boolean> {
        try {
            const lernaJson = await fs.readJson(path.join(directory, "lerna.json")) as LernaJson;
            if (lernaJson.useWorkspaces !== true) {
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
            const lernaJson = fs.readJsonSync(path.join(directory, "lerna.json")) as LernaJson;
            if (lernaJson.useWorkspaces !== true) {
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
            const lernaJson = await fs.readJson(path.join(directory, "lerna.json"));
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;
            const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

            return {
                tool: LernaTool,
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
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${LernaTool.type} monorepo root`);
        }
    },

    getPackagesSync(directory: string): Packages {
        try {
            const lernaJson = fs.readJsonSync(path.join(directory, "lerna.json")) as LernaJson;
            const pkgJson = fs.readJsonSync(path.join(directory, "package.json")) as PackageJSON;
            const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

            return {
                tool: LernaTool,
                packages: expandPackageGlobsSync(packageGlobs, directory),
                root: {
                    dir: directory,
                    packageJson: pkgJson
                }
            };
        } catch (err) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${LernaTool.type} monorepo root`);
        }
    }
}
