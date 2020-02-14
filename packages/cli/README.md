# Manypkg

Manypkg is a linter for `package.json` files in Yarn, Bolt or pnpm monorepos.

## Install

```
yarn add @manypkg/cli
```

## Usage

### `manypkg check`

`manypkg check` runs all of the [checks](#checks) against your repo, logs any errors and exits with a code

### `manypkg fix`

`manypkg check` runs all of the [checks](#checks) against your repo and fixes any of problems that can be fixed.

### `manypkg run <partial package name or directory> <script>`

`manypkg run` executes scripts for packages within a monorepo.

As an example, let's say there are two packages: `@project/package-a` at `packages/pkg-a` and `@project/package-b` at `packages/pkg-a` which both have a `start` script, `manypkg run` can be used like this:

```bash
yarn manypkg run pkg-a start
yarn manypkg run a start
yarn manypkg run package-a start
yarn manypkg run @project/package-a start
yarn manypkg run packages/pkg-a start
yarn manypkg run package-b start
yarn manypkg run b start
```

The following wouldn't work though because the `package` and `pkg` aren't unique among the package names/directories:

```bash
yarn manypkg run package start
yarn manypkg run pkg start
```
