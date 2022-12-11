
import { PackageJSON } from "@changesets/types";

/**
 * A unique string identifier for each type of supported monorepo tool.
 */
export type ToolType = "lerna" | "rush";

/**
 * A pre-loaded package json blob, with the diretory it was loaded from.
 */
export type Package = {
    packageJson: PackageJSON;
    dir: string;
};

/**
 * A collection of packages, along with the monorepo tool used to load them,
 * and (if supported by the tool) the associated "root" package.
 */
export type Packages = {
    tool: Tool;
    packages: Package[];
    root?: Package;
};

/**
 * An object representing the root of a specific monorepo, with the root
 * directory and associated monorepo tool.
 */
export type MonorepoRoot = {
    dir: string;
    tool: Tool;
};

/**
 * A monorepo tool is a specific implementation of monorepos, whether provided built-in
 * by a package manager or via some other wrapper.
 *
 * Each tool defines a common interface for detecting whether a directory is
 * a valid instance of this type of monorepo, how to retrieve the packages, etc.
 */
export interface Tool {
    /**
     * The unique string identifier for this monorepo tool.
     */
    type(): string;

    /**
     * Determine whether the specified directory is a valid root for this monorepo tool.
     * Returns a `MonorepoRoot` object if it is valid, or undefined otherwise.
     */
    isMonorepoRoot(directory: string): Promise<MonorepoRoot | undefined>;

    /**
     * Return the package collection from the specified directory. If the directory is
     * not a valid monorepo root for this tool, returns undefined instead.
     */
    getPackages(directory: string): Promise<Packages | undefined>;
}
