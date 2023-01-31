# @manypkg/find-root

## 2.1.0

### Minor Changes

- [#167](https://github.com/Thinkmill/manypkg/pull/167) [`bf586f5`](https://github.com/Thinkmill/manypkg/commit/bf586f56f14f213ac7d3e4c1ee85ef8456872c3c) Thanks [@elliot-nelson](https://github.com/elliot-nelson)! - The `findRoot` and `findRootSync` methods now take an optional list of `Tool` implementations, allowing the caller to restrict the desired types of monorepo discovered, or provide a custom monorepo tool implementation.

## 2.0.0

### Major Changes

- [#151](https://github.com/Thinkmill/manypkg/pull/151) [`a01efc9`](https://github.com/Thinkmill/manypkg/commit/a01efc9c25900b7d21b6d517a2021b021f8b3922) Thanks [@elliot-nelson](https://github.com/elliot-nelson)! - The `find-root` package now returns a new `MonorepoRoot` interface, instead of a string. This interface provides a `rootDir` for the discovered monorepo, and a `tool` object, which is an object using the new `Tool` interface provided by `@manypkg/tools`.

* [#165](https://github.com/Thinkmill/manypkg/pull/165) [`7b9c4f6`](https://github.com/Thinkmill/manypkg/commit/7b9c4f6d9a73de8b3cc45af5abc8af47f6b9206c) Thanks [@Andarist](https://github.com/Andarist)! - Removed support for Bolt monorepos.

- [#162](https://github.com/Thinkmill/manypkg/pull/162) [`f046017`](https://github.com/Thinkmill/manypkg/commit/f046017af2349f0c1bbc5b25224da0ede8ddc2d6) Thanks [@Andarist](https://github.com/Andarist)! - Increased the transpilation target of the source files to `node@14.x`. At the same time added this as `package.json#engines` to explicitly declare the minimum node version supported by this package.

### Patch Changes

- Updated dependencies [[`a01efc9`](https://github.com/Thinkmill/manypkg/commit/a01efc9c25900b7d21b6d517a2021b021f8b3922)]:
  - @manypkg/tools@1.0.0

## 1.1.0

### Minor Changes

- [`a4db72a`](https://github.com/Thinkmill/manypkg/commit/a4db72a8b272f1b642fa751639d7840f4fa3658c) [#63](https://github.com/Thinkmill/manypkg/pull/63) Thanks [@evocateur](https://github.com/evocateur)! - Add support for Lerna monorepos

## 1.0.0

### Major Changes

- [`72a0112`](https://github.com/Thinkmill/manypkg/commit/72a01127a5804cc8b881ab1a67e83a6149944ade) [#47](https://github.com/Thinkmill/manypkg/pull/47) Thanks [@tarang9211](https://github.com/tarang9211)! - Initial release of `@manypkg/find-root`
