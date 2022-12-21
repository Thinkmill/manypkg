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
        } catch (err: any) {
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
        } catch (err: any) {
            if (err.code !== "ENOENT") {
                throw err;
            }
        }
        return false;
    },

    async getPackages(directory: string): Promise<Packages> {
        const rootDir = path.resolve(directory);

        try {
            const lernaJson = await fs.readJson(path.join(directory, "lerna.json"));
            const pkgJson = (await fs.readJson(path.join(directory, "package.json"))) as PackageJSON;
            const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

            return {
                tool: LernaTool,
                packages: await expandPackageGlobs(packageGlobs, directory),
                rootPackage: {
                    relativeDir: ".",
                    packageJson: pkgJson
                },
                rootDir
            };
        } catch (err: any) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
    },

    getPackagesSync(directory: string): Packages {
        const rootDir = path.resolve(directory);

        try {
            const lernaJson = fs.readJsonSync(path.join(directory, "lerna.json")) as LernaJson;
            const pkgJson = fs.readJsonSync(path.join(directory, "package.json")) as PackageJSON;
            const packageGlobs: string[] = lernaJson.packages || ["packages/*"];

            return {
                tool: LernaTool,
                packages: expandPackageGlobsSync(packageGlobs, directory),
                rootPackage: {
                    relativeDir: ".",
                    packageJson: pkgJson
                },
                rootDir
            };
        } catch (err: any) {
            if (err.code !== "ENOENT") {
                throw err;
            }
            throw new InvalidMonorepoError(`Directory ${directory} is not a valid ${LernaTool.type} monorepo root: missing lerna.json and/or package.json`);
        }
    }
}
