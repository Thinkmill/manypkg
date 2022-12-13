/**
 * A unique string identifier for each type of supported monorepo tool.
 */
export type ToolType = "lerna" | "rush";

/**
 * A package.json access type.
 */
export type PackageAccessType = "public" | "restricted";

/**
 * An in-memory representation of a package.json file.
 */
export type PackageJSON = {
    name: string;
    version: string;
    dependencies?: {
        [key: string]: string;
    };
    peerDependencies?: {
        [key: string]: string;
    };
    devDependencies?: {
        [key: string]: string;
    };
    optionalDependencies?: {
        [key: string]: string;
    };
    private?: boolean;
    publishConfig?: {
        access?: PackageAccessType;
        directory?: string;
        registry?: string;
    };
};

/**
 * A pre-loaded package json structure, with the diretory it was loaded from.
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
 *
 * Note that this type is currently not used by Tool definitions directly,
 * but it is the suggested way to pass around a reference to a monorepo root
 * directory and associated tool.
 */
export type MonorepoRoot = {
    dir: string;
    tool: Tool;
};

/**
 * Monorepo tools may throw this error if a caller attempts to get the package
 * collection from a directory that is not a valid monorepo root.
 */
export class InvalidMonorepoError extends Error { }

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
    readonly type: string;

    /**
     * Determine whether the specified directory is a valid root for this monorepo tool.
     */
    isMonorepoRoot(directory: string): Promise<boolean>;

    /**
     * Return the package collection from the specified directory. Will throw an error
     * if the directory is not a valid monorepo root for this tool.
     */
    getPackages(directory: string): Promise<Packages>;
}