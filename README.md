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

## Checks

## External mismatch

The ranges for all dependencies(excluding `peerDependencies`) on external packages should be equal(`===`). This is so that only a single version of an external package will be installed because having multiple versions of the same package can cause confusion and bundle size problems especially with libraries like React that require there to only be a single copy of the library. It's important to note that this check does not enforce that only a single version of an external package is installed, only that two versions of an external package will never be installed because they're specified as dependencies of internal packages.

There are vague thoughts that it should be possible to partially disable external mismatch rules but we have not yet had a use case for it so we have not addressed it yet.

### How it's fixed

The highest range of the dependency is found as defined by [sembear](https://github.com/mitchellhamilton/sembear) and set as the range at every non-peer dependency place it is depended on.

## Internal mismatch

The ranges for all dependencies(excluding `peerDependencies`) on internal packages should include the version of the internal package. This is so that an internal package will never depend on another internal package but get the package from the registry because that happening is very confusing and you should always prefer a local version of any given package.

### How it's fixed

If the range is a [caret range](https://github.com/npm/node-semver#caret-ranges-123-025-004) or a [tilde range](https://github.com/npm/node-semver#tilde-ranges-123-12-1) with no other comparators, the range is set as a caret or tilde range respectively with the version of the internal package. If it is any other range, the range is set to the exact version of the internal package.

## Invalid dev and peer dependency relationship

All `peerDependencies` should also be specified in `devDependencies` and the range specified in `devDependencies` should be a subset of the range for that dependency in `peerDependencies`. This is so that `peerDependencies` are available in the package during development for testing and etc.

### How it's fixed

The range for the dependency specified in `peerDependencies` is added to `devDependencies` unless the package is already a non-peer dependency elsewhere in the repo in which, that range is used instead.

### Root has devDependencies

Whether a dependency is in `devDependencies` or `dependencies` do not make a difference in the root/private packages in general(though we don't enforce it for all private packages to support the case where a package is private for development or etc. and then published) so to avoid confusion as to where a root dependency should go, all dependencies should go in `dependencies`. This decision may be changed in the future to force all root dependencies to be in `dependencies` so that installation instructions for development packages do not have to be different for monorepos.

#### How it's fixed

All `devDependencies` at the root are moved to `dependencies`.

### Multiple dependency types

A dependency shouldn't be specified in more than one of `dependencies`, `devDependencies` or `optionalDependencies` because what would that even do? TODO: find out what package managers actually do when this happens

#### How it's fixed

The dep is removed from `devDependencies` or `optionalDependencies`.

### Invalid package name

There are rules from npm about what a package name can be. This is already enforced by npm on publish but in a monorepo, everything will be published together so some packages may depend on a package which can't be published so we should check that package names are valid before publishing.

### Unsorted dependencies

Dependencies should be sorted alphabetically because when you add a package with yarn add or etc. deps are sorted and that results in confusing diffs so we should enforce that they're sorted.

#### How it's fixed

This is fixed by sorting deps by key alphabetically.
