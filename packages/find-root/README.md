# @manypkg/find-root

> Find the root of a monorepo with Yarn workspaces, Bolt or pnpm

## Install

```bash
yarn add @manypkg/find-root
```

## Usage

```tsx
import { findRoot } from "@manypkg/find-root";

let dir = await findRoot(process.cwd());
```
