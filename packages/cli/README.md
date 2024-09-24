# Manypkg

Manypkg is a linter for `package.json` files in Yarn, Bolt, Lerna, pnpm or Rush monorepos.

## Install

```
yarn add @manypkg/cli
```

## Usage

### `manypkg check`

`manypkg check` runs all of the [checks](#checks) against your repo, logs any errors and exits with a code

### `manypkg fix`

`manypkg check` runs all of the [checks](#checks) against your repo and fixes any of problems that can be fixed.

### `manypkg upgrade <packageName> <tag or version>`

This command helps you quickly upgrade your dependencies in a monorepo, or for packages from another scope. This is similar to `yarn upgrade` with slightly different ergonomics. At its most basic:

`manypkg upgrade react`

This will find every instance of react in your packages, and upgrade it to latest.

`manypkg upgrade react next`

This will find every instance of react in your packages, and upgrade it to the next tag on npm.

Using tags respects your version range specifier (carat, or tilde dependency type).

You can also specify a version or version range such as:

`manypkg upgrade react ^16.3.0`

#### Upgrading all dependencies in a scope

If you specify a scope, rather than a package name, you can upgrade all packages within a scope, for example:

`manypkg upgrade @keystonejs`

This would upgrade all packages in the `keystone` scope to latest across your repository. You can specify a tag, or a version range. If you specify a tag, it will update every package that has a tag at this scope.

If you specify a version range, all packages in the scope will be updated to that version range and then an install will be attempted, but you will have errors if not all packages in the scope have that version.

### `manypkg npm-tag tagname (--otp OTP_CODE)`

This gets each public package in the repo, and adds the npm tag specified to the current version of each. This can be run after publish to give a particular release a name.

`manypkg npm-tag charmander`

> WARNING - npm-tag is not currently particularly robust in its implementation. The logging and feedback are likely to be poor

### `manypkg run <partial package name or directory> <script>`

`manypkg run` executes scripts for packages within a monorepo.

As an example, let's say there are two packages: `@project/package-a` at `packages/pkg-a` and `@project/package-b` at `packages/pkg-b` which both have a `start` script, `manypkg run` can be used like this:

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

In order to target a package with a name that is a substring of another (`@project/package-a` at `packages/pkg-a` and `@project/package-a-1` at `packages/pkg-a-1`), use the exact package or directory name:

```bash
yarn manypkg run @project/package-a start
yarn manypkg run packages/pkg-a start
```
