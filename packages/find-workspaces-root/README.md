# find-workspaces-root

> Find the root of a multi-package repo with Yarn workspaces or Bolt

## Install

```bash
yarn add find-workspaces-root
```

## Usage

```tsx
import findWorkspacesRoot from "find-workspaces-root";

let dir = await findWorkspacesRoot(process.cwd());
```
