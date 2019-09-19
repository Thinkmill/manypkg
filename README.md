# manypkg

`manypkg` is a CLI to make working in multi-package repos easier based on some of my experiences working in multi-package repos, conversations with other people and lots of learnings from `bolt` and `bolt-check`.

## Install

```
yarn add @manypkg/cli
```

## Usage

### Checker

```
yarn manypkg check
```

```
yarn manypkg fix
```

## Dictionary

- **private package** - A package that has `private: true`/is not published. It does not refer to a package published to a private registry here.
- **internal package/workspace** - A package that is local/in the repo
- **external package** - A package that is from a registry like npm
- **range** - A [node-semver range](https://github.com/npm/node-semver#ranges)
- **highest range** - The range which has the highest lower bound. If there are multiple ranges with the same highest lower bound, the range with the highest upper bound is the highest range.

## Checks

## External mismatch

The ranges for all dependencies(excluding `peerDependencies`) on external packages should exactly match(`===`). This is so that only a single version of an external package will be installed because having multiple versions of the same package can cause confusion and bundle size problems especially with libraries like React that require there to only be a single copy of the library. It's important to note that this check does not enforce that only a single version of an external package is installed, only that two versions of an external package will never be installed because they're specified as dependencies of internal packages.

There are vague thoughts that it should be possible to partially disable external mismatch rules but we have not yet had a use case for it so we have not addressed it yet.

### How it's fixed

The highest range of the dependency is set as the range at every non-peer dependency place it is depended on.

## Internal mismatch

The ranges for all dependencies(excluding `peerDependencies`) on internal packages should include the version of the internal package. This is so that an internal package will never depend on another internal package but get the package from the registry because that happening is very confusing and you should always prefer a local version of any given package.

### How it's fixed

If the range is a [caret range](https://github.com/npm/node-semver#caret-ranges-123-025-004) or a [tilde range](https://github.com/npm/node-semver#tilde-ranges-123-12-1) with no other comparators, the range is set as a caret or tilde range respectively with the version of the internal package. If it is any other range, the range is set to the exact version of the internal package.

## Invalid dev and peer dependency relationship

All `peerDependencies` should also be specified in `devDependencies` and the range specified in `devDependencies` should be a subset of the range for that dependency in `peerDependencies`. This is so that `peerDependencies` are available in the package during development for testing and etc.

### How it's fixed

The range for the dependency specified in `peerDependencies` is added to `devDependencies` unless the package is already a non-peer dependency elsewhere in the repo in which, that range is used instead.

### Root has devDependencies

In the root `package.json` of a multi-package repository, whether a dependency is in `devDependencies` or `dependencies` does not make a difference. To avoid confusion as to where a root dependency should go, all dependencies should go in `dependencies`.

#### How it's fixed

All `devDependencies` in the root `package.json` are moved to `dependencies`.

### Multiple dependency types

A dependency shouldn't be specified in more than one of `dependencies`, `devDependencies` or `optionalDependencies`.

#### How it's fixed

The dep is removed from `devDependencies` or `optionalDependencies` if it's also in `dependencies`, if it's in `devDependencies` and `optionalDependencies`, it is removed from `dependencies`.

### Invalid package name

There are rules from npm about what a package name can be. This is already enforced by npm on publish but in a multi-package repository, everything will be published together so some packages may depend on a package which can't be published. Checking for invalid package names prevents this kind of publish failure.

#### How it's fixed

This requires manual fixing as automatically fixing this may lead to valid but incorrect package names.

### Unsorted dependencies

When you add a package with `yarn add` or etc. dependencies are sorted, and this can cause confusing diffs if the dependencies were not previously sorted.  Dependencies should be sorted alphabetically to avoid this.

#### How it's fixed

This is fixed by sorting deps by key alphabetically.
