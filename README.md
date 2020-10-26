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

The highest range of the dependency is set as the range at every non-peer dependency place it is depended on.

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

This example will cause an error because the range `1.0.0` for `some-external-package` specified in `@manypkg-example/pkg-a` is not equal(`===`) to the range `2.0.0` specified in `@manypkg-example/pkg-b`.

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

### Root has devDependencies

The root package should not have any `devDependencies`, instead all dependencies should be in `dependencies`

### Why it's a rule

The root `package.json` of a monorepo is not published so whether a dependency is in `devDependencies` or `dependencies` does not make a difference and having one place to put dependencies in the root means that people do not have to arbitrarily decide where a dependency should go every time they install one.

#### How it's fixed

All `devDependencies` in the root `package.json` are moved to `dependencies`.

### Multiple dependency types

A dependency shouldn't be specified in more than one of `dependencies`, `devDependencies` or `optionalDependencies`.

#### How it's fixed

The dep is removed from `devDependencies` or `optionalDependencies` if it's also in `dependencies`, if it's in `devDependencies` and `optionalDependencies`, it is removed from `dependencies`.

### Invalid package name

There are rules from npm about what a package name can be and a package will fail to publish if those rules are not met.

#### Why it's a rule

All packages will be published together so some packages may depend on a package which can't be published. Checking for invalid package names prevents this kind of publish failure.

#### How it's fixed

This requires manual fixing as automatically fixing this may lead to valid but incorrect package names.

### Unsorted dependencies

Dependencies in the dependency fields(`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`) should be sorted alphabetically.

### Why it's a rule

When you add a package with `yarn add` or etc. dependencies are sorted, and this can cause confusing diffs if the dependencies were not previously sorted.

#### How it's fixed

This is fixed by sorting deps by key alphabetically.

### Incorrect `repository` field

If a GitHub repo URL is in the `repository` field in the root `package.json`, all of the packages should have a `repository` field which goes into the directory of the package.

### Why it's a rule

Having a `repository` field is helpful so there is a link to the source of a package on npm but setting that field on every package and making sure it's correct is error prone and time consuming.

#### How it's fixed

This is fixed by setting the correct URL.
