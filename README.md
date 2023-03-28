<a href="https://www.thinkmill.com.au/">
  <img src=".github/assets/manypkg-banner.svg" alt="An umbrella for your monorepo">
  </br>
  </br>
</a>
<p>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@manypkg/cli.svg">
    <img alt="" src="https://img.shields.io/npm/v/@manypkg/cli.svg?style=for-the-badge&labelColor=0869B8">
  </a>
  <a aria-label="License" href="#">
    <img alt="" src="https://img.shields.io/npm/l/@manypkg/cli.svg?style=for-the-badge&labelColor=579805">
  </a>
  <a href="https://www.npmjs.com/package/@manypkg/cli">
    <img alt="weekly downloads from npm" src="https://img.shields.io/npm/dw/@manypkg/cli.svg?style=for-the-badge&labelColor=30A800">
  </a>
  <a aria-label="Thinkmill Logo" href="https://www.thinkmill.com.au/open-source?utm_campaign=github-manypkg">
    <img src="https://img.shields.io/badge/Sponsored%20BY%20Thinkmill-ed0000.svg?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTg2IiBoZWlnaHQ9IjU4NiIgdmlld0JveD0iMCAwIDU4NiA1ODYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xOTk2XzQwNikiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTU4NiAyOTNDNTg2IDQ1NC44MTkgNDU0LjgxOSA1ODYgMjkzIDU4NkMxMzEuMTgxIDU4NiAwIDQ1NC44MTkgMCAyOTNDMCAxMzEuMTgxIDEzMS4xODEgMCAyOTMgMEM0NTQuODE5IDAgNTg2IDEzMS4xODEgNTg2IDI5M1pNMjA1Ljc3NiAzNTguOTQ0QzE5MS4zNzYgMzU4Ljk0NCAxODUuOTA0IDM1Mi4zMiAxODUuOTA0IDMzNS45MDRWMjYyLjc1MkgyMTQuNDE2VjIzNy42OTZIMTg1LjkwNFYyMDEuMTJIMTUzLjA3MlYyMzcuNjk2SDEyOC41OTJWMjYyLjc1MkgxNTMuMDcyVjM0MC44QzE1My4wNzIgMzcyLjc2OCAxNjYuNjA4IDM4NS43MjggMTk3LjQyNCAzODUuNzI4QzIwMy40NzIgMzg1LjcyOCAyMTAuOTYgMzg0LjU3NiAyMTUuODU2IDM4My4xMzZWMzU3LjUwNEMyMTMuNTUyIDM1OC4zNjggMjA5LjUyIDM1OC45NDQgMjA1Ljc3NiAzNTguOTQ0Wk00MDcuMzc2IDIzNC4yNEMzODUuMiAyMzQuMjQgMzcxLjA4OCAyNDQuMDMyIDM2MC40MzIgMjYwLjczNkMzNTIuOTQ0IDI0My40NTYgMzM3LjM5MiAyMzQuMjQgMzE3LjIzMiAyMzQuMjRDMjk5Ljk1MiAyMzQuMjQgMjg2Ljk5MiAyNDEuMTUyIDI3Ni42MjQgMjU1LjI2NEgyNzYuMDQ4VjIzNy42OTZIMjQ0LjY1NlYzODRIMjc3LjQ4OFYzMDUuNjY0QzI3Ny40ODggMjc3LjQ0IDI4OC43MiAyNjAuNzM2IDMwOC4zMDQgMjYwLjczNkMzMjUuMjk2IDI2MC43MzYgMzM0LjUxMiAyNzIuODMyIDMzNC41MTIgMjkzLjU2OFYzODRIMzY3LjM0NFYzMDUuMDg4QzM2Ny4zNDQgMjc3LjE1MiAzNzguODY0IDI2MC43MzYgMzk4LjE2IDI2MC43MzZDNDE0LjU3NiAyNjAuNzM2IDQyNC42NTYgMjcxLjEwNCA0MjQuNjU2IDI5Ny4wMjRWMzg0SDQ1Ny40ODhWMjkzLjg1NkM0NTcuNDg4IDI1NC40IDQzOC40OCAyMzQuMjQgNDA3LjM3NiAyMzQuMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzE5OTZfNDA2Ij4KPHJlY3Qgd2lkdGg9IjU4NiIgaGVpZ2h0PSI1ODYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==&labelColor=C60200&locoColor=white&logoWidth=0">
  </a>
</p>

---

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

`manypkg fix` runs all of the [checks](#checks) against your repo and fixes any of problems that can be fixed.

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

In order to target a package with a name that is a substring of another (for example, `@project/package-a` at `packages/pkg-a` and `@project/package-a-1` at `packages/pkg-a-1`), use the exact package or directory name:

```bash
yarn manypkg run @project/package-a start
yarn manypkg run packages/pkg-a start
```

### `manypkg exec <cli command>`

`manypkg exec` executes a command for all packages within a monorepo.

As an example, let's say there are two packages which both have a `dist` dir, `manypkg exec` can be used like this:

```bash
yarn manypkg exec rm -rf dist
```

## Dictionary

- **private package** - A package that has `private: true`/is not published. It does not refer to a package published to a private registry here.
- **internal package** - A package that is local/in the repo
- **external package** - A package that is from a registry like npm
- **range** - A [node-semver range](https://github.com/npm/node-semver#ranges)
- **highest range** - The range which has the highest lower bound. If there are multiple ranges with the same highest lower bound, the range with the highest upper bound is the highest range.

## Checks

## External mismatch

The ranges for all dependencies(excluding `peerDependencies`) on external packages should exactly match(`===`). It's important to note that this check does not enforce that only a single version of an external package is installed, only that two versions of an external package will never be installed because they're specified as dependencies of internal packages.

### Why it's a rule

So that only a single version of an external package will be installed because having multiple versions of the same package can cause confusion and bundle size problems especially with libraries like React that require there to only be a single copy of the library.

### How it's fixed

The most commonly used range of the dependency is set as the range at every non-peer dependency place it is depended on.
If for some reason, every range is used the same amount of times, they'll all be fixed to the highest version.

### Examples

<details><summary>Incorrect example</summary>

> NOTE: This example uses Yarn Workspaces but this will work the same with Bolt and pnpm

`package.json`

```json
{
  "name": "@manypkg-example/repo",
  "version": "1.0.0",
  "workspaces": ["packages/*"]
}
```

`packages/pkg-a/package.json`

```json
{
  "name": "@manypkg-example/pkg-a",
  "version": "1.0.0",
  "dependencies": {
    "some-external-package": "1.0.0"
  }
}
```

`packages/pkg-b/package.json`

```json
{
  "name": "@manypkg-example/pkg-b",
  "version": "1.0.0",
  "dependencies": {
    "some-external-package": "2.0.0"
  }
}
```

`packages/pkg-c/package.json`

```json
{
  "name": "@manypkg-example/pkg-c",
  "version": "1.0.0",
  "dependencies": {
    "some-external-package": "1.0.0"
  }
}
```

This example will cause an error because the range `2.0.0` for `some-external-package` specified in `@manypkg-example/pkg-b` is not equal(`===`) to the range `1.0.0` specified in `@manypkg-example/pkg-a` and `@manypkg-example/pkg-c`.

</details>

<details><summary>Correct example</summary>

> NOTE: This example uses Yarn Workspaces but this will work the same with Bolt and pnpm

`package.json`

```json
{
  "name": "@manypkg-example/repo",
  "version": "1.0.0",
  "workspaces": ["packages/*"]
}
```

`packages/pkg-a/package.json`

```json
{
  "name": "@manypkg-example/pkg-a",
  "version": "1.0.0",
  "dependencies": {
    "some-external-package": "1.0.0"
  }
}
```

`packages/pkg-b/package.json`

```json
{
  "name": "@manypkg-example/pkg-b",
  "version": "1.0.0",
  "dependencies": {
    "some-external-package": "1.0.0"
  }
}
```

This example will not cause an error because the range `1.0.0` for `some-external-package` specified in `@manypkg-example/pkg-a` is equal(`===`) to the range `1.0.0` specified in `@manypkg-example/pkg-b`.

</details>

### Ignoring this rule

There are some cases where you might want to intentionally have conflicts between versions. To do this, you can use something that isn't a valid semver range instead of a range such as a git url or etc. If you'd like a conflicting version of an npm package, you can use `npm:pkg-name@your-range-here` instead of just a range and it will be ignored.

> Note: Do this with care, having different versions of the same package can lead to strange bugs

## Internal mismatch

The ranges for all regular dependencies, devDependencies and optionalDependencies(not peerDependencies) on internal packages should include the version of the internal package.

### Why it's a rule

So that an internal package that depends on another internal package will always get the local version of the internal package rather than a version from the registry because installing internal packages from the registry can be very confusing since you generally expect to get the local version when you depend on an internal package.

### How it's fixed

If the range is a [caret range](https://github.com/npm/node-semver#caret-ranges-123-025-004) or a [tilde range](https://github.com/npm/node-semver#tilde-ranges-123-12-1) with no other comparators, the range is set as a caret or tilde range respectively with the version of the internal package. If it is any other range, the range is set to the exact version of the internal package.

## Invalid dev and peer dependency relationship

All `peerDependencies` should also be specified in `devDependencies` and the range specified in `devDependencies` should be a subset of the range for that dependency in `peerDependencies`.

### Why it's a rule

This is so that `peerDependencies` are available in the package during development for testing and etc.

### How it's fixed

The range for the dependency specified in `peerDependencies` is added to `devDependencies` unless the package is already a non-peer dependency elsewhere in the repo in which, that range is used instead.

## Root has devDependencies

The root package should not have any `devDependencies`, instead all dependencies should be in `dependencies`

### Why it's a rule

The root `package.json` of a monorepo is not published so whether a dependency is in `devDependencies` or `dependencies` does not make a difference and having one place to put dependencies in the root means that people do not have to arbitrarily decide where a dependency should go every time they install one.

### How it's fixed

All `devDependencies` in the root `package.json` are moved to `dependencies`.

## Multiple dependency types

A dependency shouldn't be specified in more than one of `dependencies`, `devDependencies` or `optionalDependencies`.

### How it's fixed

The dep is removed from `devDependencies` or `optionalDependencies` if it's also in `dependencies`, if it's in `devDependencies` and `optionalDependencies`, it is removed from `dependencies`.

## Invalid package name

There are rules from npm about what a package name can be and a package will fail to publish if those rules are not met.

### Why it's a rule

All packages will be published together so some packages may depend on a package which can't be published. Checking for invalid package names prevents this kind of publish failure.

### How it's fixed

This requires manual fixing as automatically fixing this may lead to valid but incorrect package names.

## Unsorted dependencies

Dependencies in the dependency fields(`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`) should be sorted alphabetically.

### Why it's a rule

When you add a package with `yarn add` or etc. dependencies are sorted, and this can cause confusing diffs if the dependencies were not previously sorted.

### How it's fixed

This is fixed by sorting deps by key alphabetically.

## Incorrect `repository` field

If a GitHub repo URL is in the `repository` field in the root `package.json`, all of the packages should have a `repository` field which goes into the directory of the package.

### Why it's a rule

Having a `repository` field is helpful so there is a link to the source of a package on npm but setting that field on every package and making sure it's correct is error prone and time consuming.

#### How it's fixed

This is fixed by setting the correct URL.

## License

Copyright (c) 2023 Thinkmill Labs Pty Ltd. Licensed under the MIT License.
