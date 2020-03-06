# Get Packages

> A simple utility to get workspaces, whether they be yarn or bolt.

This library exports a very simple function that looks at a package.json, and generates
the glob of accepted workspaces from the `workspaces` field. It is intended mostly for
use of developers building tools that want to support both kinds of mono-repos as an easy
way to write tools for both.

```javascript
import getPackages from "@manypkg/get-packages";

const { tool, root, packages } = await getPackages();
```

Workspaces have the shape:

```typescript
type Tool = "yarn" | "bolt" | "pnpm" | "root";

export type Package = { packageJson: PackageJSON; dir: string };

type Packages = {
  tool: Tool;
  packages: Package[];
  root: Package;
};

export function getPackages(cwd: string): Promise<Packages>;
export function getPackagesSync(cwd: string): Packages;
```

## Config

We assume the function is being run from a directory with the package.json you want to target,
however you can pass in a working directory if you want. In addition, you can change what tools
the package will scan for.

```javascript
const packages = await getPackages(cwd);
```

The tools supported are `yarn`, `bolt`, `pnpm` and `root`, which returns the root package as a single workspace if passed.
