# @manypkg/get-packages

## 1.0.1

### Patch Changes

- [`596d821`](https://github.com/Thinkmill/manypkg/commit/596d82108bfb2debdfd6c82569ae5efb5b5ed587) [#55](https://github.com/Thinkmill/manypkg/pull/55) Thanks [@Andarist](https://github.com/Andarist)! - Ignore `node_modules` when glob searching for packages. This fixes an issue with package cycles.

## 1.0.0

### Major Changes

- [`72a0112`](https://github.com/Thinkmill/manypkg/commit/72a01127a5804cc8b881ab1a67e83a6149944ade) [#47](https://github.com/Thinkmill/manypkg/pull/47) Thanks [@tarang9211](https://github.com/tarang9211)! - Initial release of `@manypkg/get-packages`. If you're migrating from `get-workspaces`, the most important changes are:

  - getPackages is a named export
  - getPackages only accepts a single argument which is the directory to search from
  - getPackages returns an object which has `tool`, `packages` and `root`
  - getPackages will search up from the directory passed in to find a project root rather than requiring the project root to be passed in
  - the package objects no longer have a `name` field and the `config` property has been renamed to `packageJson`

  See the README for more information on the new API

### Patch Changes

- Updated dependencies [[`72a0112`](https://github.com/Thinkmill/manypkg/commit/72a01127a5804cc8b881ab1a67e83a6149944ade)]:
  - @manypkg/find-root@1.0.0
