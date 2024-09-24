# @manypkg/cli

## 0.21.4

### Patch Changes

- [#206](https://github.com/Thinkmill/manypkg/pull/206) [`c2c4a3b`](https://github.com/Thinkmill/manypkg/commit/c2c4a3b80d593c81d92878c161cc69cd141ac806) Thanks [@bdkopen](https://github.com/bdkopen)! - Fix `manypkg upgrade @scope` upgrading packages like `@scope-something/a`

## 0.21.3

### Patch Changes

- [#204](https://github.com/Thinkmill/manypkg/pull/204) [`b56869a`](https://github.com/Thinkmill/manypkg/commit/b56869a23d04bf0dedcb8e399aa339a5e35172b1) Thanks [@emmatown](https://github.com/emmatown)! - Allow dependecies to use the `workspace:` protocol and support adding `"workspaceProtocol": "require"` to the `manypkg` config to require it.

- Updated dependencies [[`3c9641c`](https://github.com/Thinkmill/manypkg/commit/3c9641c94980a887fdb4366698ad69199883ff84)]:
  - @manypkg/get-packages@2.2.1

## 0.21.2

### Patch Changes

- [#194](https://github.com/Thinkmill/manypkg/pull/194) [`56a64c5`](https://github.com/Thinkmill/manypkg/commit/56a64c5d29565195d0f5013425ee1e2e5fdbe754) Thanks [@KATT](https://github.com/KATT)! - fix: allow tags in `npm:x`-deps

## 0.21.1

### Patch Changes

- [#181](https://github.com/Thinkmill/manypkg/pull/181) [`1e31ced`](https://github.com/Thinkmill/manypkg/commit/1e31cedbbe09c15cbf38c43c8c286f6af62ef18c) Thanks [@fbartho](https://github.com/fbartho)! - Updated `package-json` dependency.

## 0.21.0

### Minor Changes

- [#174](https://github.com/Thinkmill/manypkg/pull/174) [`de0fff3`](https://github.com/Thinkmill/manypkg/commit/de0fff37af9e6dc21b75b7115381483c1e85b8a7) Thanks [@steve-taylor](https://github.com/steve-taylor)! - Restored support for Bolt monorepos.

### Patch Changes

- Updated dependencies [[`de0fff3`](https://github.com/Thinkmill/manypkg/commit/de0fff37af9e6dc21b75b7115381483c1e85b8a7)]:
  - @manypkg/get-packages@2.2.0

## 0.20.0

### Minor Changes

- [#165](https://github.com/Thinkmill/manypkg/pull/165) [`7b9c4f6`](https://github.com/Thinkmill/manypkg/commit/7b9c4f6d9a73de8b3cc45af5abc8af47f6b9206c) Thanks [@Andarist](https://github.com/Andarist)! - Removed support for Bolt monorepos.

* [#162](https://github.com/Thinkmill/manypkg/pull/162) [`f046017`](https://github.com/Thinkmill/manypkg/commit/f046017af2349f0c1bbc5b25224da0ede8ddc2d6) Thanks [@Andarist](https://github.com/Andarist)! - Increased the transpilation target of the source files to `node@14.x`. At the same time added this as `package.json#engines` to explicitly declare the minimum node version supported by this package.

### Patch Changes

- Updated dependencies [[`7b9c4f6`](https://github.com/Thinkmill/manypkg/commit/7b9c4f6d9a73de8b3cc45af5abc8af47f6b9206c), [`f046017`](https://github.com/Thinkmill/manypkg/commit/f046017af2349f0c1bbc5b25224da0ede8ddc2d6), [`a01efc9`](https://github.com/Thinkmill/manypkg/commit/a01efc9c25900b7d21b6d517a2021b021f8b3922)]:
  - @manypkg/get-packages@2.0.0

## 0.19.2

### Patch Changes

- [#136](https://github.com/Thinkmill/manypkg/pull/136) [`6063c55`](https://github.com/Thinkmill/manypkg/commit/6063c559907580c15b78160eb529438b18c67017) Thanks [@ChalkPE](https://github.com/ChalkPE)! - Remove unused `get-workspaces` dependency

## 0.19.1

### Patch Changes

- [#122](https://github.com/Thinkmill/manypkg/pull/122) [`7bd4f34`](https://github.com/Thinkmill/manypkg/commit/7bd4f344e1024e880a2de6b571d556adf200f0b6) Thanks [@fz6m](https://github.com/fz6m)! - Fixed getting correct packages in pnpm workspaces with exclude rules.

- Updated dependencies [[`7bd4f34`](https://github.com/Thinkmill/manypkg/commit/7bd4f344e1024e880a2de6b571d556adf200f0b6)]:
  - @manypkg/get-packages@1.1.3

## 0.19.0

### Minor Changes

- [#119](https://github.com/Thinkmill/manypkg/pull/119) [`256297b`](https://github.com/Thinkmill/manypkg/commit/256297b9bf1368252214637fec1811ce868a71c9) Thanks [@marcodejongh](https://github.com/marcodejongh)! - Change external mismatch behaviour to suggest and fix to the most commonly used dependency range in the workspace. If all ranges are only used once it will pick the highest.

### Patch Changes

- Updated dependencies [[`5f6cded`](https://github.com/Thinkmill/manypkg/commit/5f6cdedf6843d60144c1ea65b5a8ef0c4b7f0bd5)]:
  - @manypkg/get-packages@1.1.2

## 0.18.0

### Minor Changes

- [`dc2b0f9`](https://github.com/Thinkmill/manypkg/commit/dc2b0f90cf208f997be91adf419501d976f0cf78) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `manypkg.ignoredRules` config option

### Patch Changes

- [`72227d5`](https://github.com/Thinkmill/manypkg/commit/72227d51eb681c13760f7325bce324b46a179eaf) [#90](https://github.com/Thinkmill/manypkg/pull/90) Thanks [@jroebu14](https://github.com/jroebu14)! - Removes vulnerable and unused package meow

## 0.17.0

### Minor Changes

- [`ad6dbf1`](https://github.com/Thinkmill/manypkg/commit/ad6dbf11d0e17a61d06cb77a89312d875e2b7511) [#85](https://github.com/Thinkmill/manypkg/pull/85) Thanks [@with-heart](https://github.com/with-heart)! - Added the ability to use the exact package or directory name to target a package that is a substring of another with for the `run` command:

  If packages exist at `packages/pkg-a` and `packages/pkg-a-1`, target `pkg-a` using the exact directory name:

  ```bash
  yarn manypkg run packages/pkg-a
  ```

  If packages are named `@project/package-a` and `@project/package-a-1`, target `package-a` using the exact package name:

  ```bash
  yarn manypkg run @project/package-a
  ```

## 0.16.2

### Patch Changes

- [`7d421b2`](https://github.com/Thinkmill/manypkg/commit/7d421b2074b3d7f3077a542428448c26b5d563a8) [#79](https://github.com/Thinkmill/manypkg/pull/79) Thanks [@zzarcon](https://github.com/zzarcon)! - Bump meow to ^6.0.0

* [`3f0ac13`](https://github.com/Thinkmill/manypkg/commit/3f0ac130f836700cb48202f3b16dfa042701e226) [#77](https://github.com/Thinkmill/manypkg/pull/77) Thanks [@Andarist](https://github.com/Andarist)! - Fixed a typo in the reported error message for the peer and dev dep check

## 0.16.1

### Patch Changes

- [`0f46c0f`](https://github.com/Thinkmill/manypkg/commit/0f46c0fd3c2fd5da5de5dcd3663ea8a2241989d6) [#75](https://github.com/Thinkmill/manypkg/pull/75) Thanks [@Noviny](https://github.com/Noviny)! - Update README.md - small typo

## 0.16.0

### Minor Changes

- [`3f8eb78`](https://github.com/Thinkmill/manypkg/commit/3f8eb788c4c1682424c14b9f5eeb40ac15a0af0b) [#73](https://github.com/Thinkmill/manypkg/pull/73) Thanks [@Noviny](https://github.com/Noviny)! - Add new command to upgrade packages easily with manypkg

* [`3f8eb78`](https://github.com/Thinkmill/manypkg/commit/3f8eb788c4c1682424c14b9f5eeb40ac15a0af0b) [#73](https://github.com/Thinkmill/manypkg/pull/73) Thanks [@Noviny](https://github.com/Noviny)! - Add new command 'npm-tag'

## 0.15.0

### Minor Changes

- [`f2e890e`](https://github.com/Thinkmill/manypkg/commit/f2e890e76b718c36c8d08b49a54288cd2aecedfd) [#68](https://github.com/Thinkmill/manypkg/pull/68) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Ignore invalid ranges on external dependencies to allow git and other types of dependencies and allow people to ignore the external mismatch rule for certain dependencies by making dependencies `npm:^1.0.0` instead of `^1.0.0`.

### Patch Changes

- Updated dependencies [[`35fcc9c`](https://github.com/Thinkmill/manypkg/commit/35fcc9cba7ccec6667826da84ed02dff166c50a3)]:
  - @manypkg/get-packages@1.1.1

## 0.14.0

### Minor Changes

- [`f8f60d9`](https://github.com/Thinkmill/manypkg/commit/f8f60d9bd968cf2c7bef2a1e7c257398316ee12c) [#67](https://github.com/Thinkmill/manypkg/pull/67) Thanks [@jesstelford](https://github.com/jesstelford)! - Add package.json#manypkg config object:

  ```
  {
    "manypkg": {}
  }
  ```

  To support setting a default branch for the INCORRECT_REPOSITORY_FIELD check/fix, a new config option can be set:

  ```
  {
    "manypkg": {
      "defaultBranch": "master"
    }
  }
  ```

  The default `defaultBranch` is `"master"`.

### Patch Changes

- [`a4db72a`](https://github.com/Thinkmill/manypkg/commit/a4db72a8b272f1b642fa751639d7840f4fa3658c) [#63](https://github.com/Thinkmill/manypkg/pull/63) Thanks [@evocateur](https://github.com/evocateur)! - Add support for Lerna monorepos

- Updated dependencies [[`a4db72a`](https://github.com/Thinkmill/manypkg/commit/a4db72a8b272f1b642fa751639d7840f4fa3658c)]:
  - @manypkg/get-packages@1.1.0

## 0.13.0

### Minor Changes

- [`3be8695`](https://github.com/Thinkmill/manypkg/commit/3be86952c0fcdf1de6c5bd7f5b3362917d6a4546) [#61](https://github.com/Thinkmill/manypkg/pull/61) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove check requiring that all devDependencies must be `*`. This has been removed because pre-release versions are not satisfied by `*` which means that you previously couldn't use Manypkg, have internal devDependencies and have pre-releases

## 0.12.0

### Minor Changes

- [`3594303`](https://github.com/Thinkmill/manypkg/commit/35943031c777b6a879260147ae6df36073d4191d) [#51](https://github.com/Thinkmill/manypkg/pull/51) Thanks [@tarang9211](https://github.com/tarang9211)! - Use @manypkg/get-packages instead of get-workspaces internally

## 0.11.1

### Patch Changes

- [`503f242`](https://github.com/Thinkmill/manypkg/commit/503f24292626849d54216121b742c27af9f9e70f) [#53](https://github.com/Thinkmill/manypkg/pull/53) Thanks [@NateRadebaugh](https://github.com/NateRadebaugh)! - Add special logic for `INCORRECT_REPOSITORY_FIELD` check to handle github repository separately from azure

## 0.11.0

### Minor Changes

- [`d73628d`](https://github.com/Thinkmill/manypkg/commit/d73628db75a8ff3088cb4e62813dbf31b13b72bb) [#48](https://github.com/Thinkmill/manypkg/pull/48) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add repository field check which checks if a GitHub repo URL is in the `repository` field in the root `package.json` and if it is, checks that all of the packages have a `repository` field which goes into the directory of the package.

## 0.10.1

### Patch Changes

- [`447c580`](https://github.com/Thinkmill/manypkg/commit/447c58010816c72a3a2a32504a284f9fb979dff1) [#45](https://github.com/Thinkmill/manypkg/pull/45) Thanks [@NateRadebaugh](https://github.com/NateRadebaugh)! - Add reference to `manypkg exec` to readme

* [`c5275fb`](https://github.com/Thinkmill/manypkg/commit/c5275fba714c68539d304f07eb19962704fd560d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Show a more informative error when a package has no name

## 0.10.0

### Minor Changes

- [`63cdae1`](https://github.com/Thinkmill/manypkg/commit/63cdae1bc7fd3b699756144bce4ddf53c46afeb0) [#42](https://github.com/Thinkmill/manypkg/pull/42) Thanks [@tarang9211](https://github.com/tarang9211)! - Added `manypkg run <partial package name or directory> <script>` which can be used to execute scripts for packages within a monorepo.

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

* [`0ed3f2b`](https://github.com/Thinkmill/manypkg/commit/0ed3f2b55aa01a33654de28c0e5a4249af9872a3) [#39](https://github.com/Thinkmill/manypkg/pull/39) Thanks [@Andarist](https://github.com/Andarist)! - Added support for finding pnpm workspace packages.

### Patch Changes

- Updated dependencies [[`0ed3f2b`](https://github.com/Thinkmill/manypkg/commit/0ed3f2b55aa01a33654de28c0e5a4249af9872a3)]:
  - find-workspaces-root@0.2.0

## 0.9.0

### Minor Changes

- [`528bb72`](https://github.com/Thinkmill/manypkg/commit/528bb72bf600de0d135bfd426fe2c3d52fbed223) [#30](https://github.com/Thinkmill/manypkg/pull/30) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Changed peer and dev dependency relationship check to only require that the upper bound of the dev dep range is within the peer dep range so that cases where the dev dep range allows versions lower than the lower bound of such as a peer dep with `^1.0.0` and dev dep with `*` are allowed and this fixes the regression in 0.8.1 where cases that should have been fine weren't like a peer dep with `^1.0.0` and a dev dep with `^1.1.0`

## 0.8.1

### Patch Changes

- dcbfa46: Fix an error with the new internal dependencies being "\*", which was incompatible with the peerDependency check

## 0.8.0

### Minor Changes

- 86bd46d: Add new check: INTERNAL_DEV_DEP_NOT_STAR

  This check moves internal devDependencies between packages to be `*` - so in a case where I had a package sunshine, which depends on internal package 'sun':

  ```json
  {
    "name": "sunshine",
    "version": "1.0.0",
    "devDependencies": {
      "sun": "^1.0.0"
    }
  }
  ```

  we will now have:

  ```json
  {
    "name": "sunshine",
    "version": "1.0.0",
    "devDependencies": {
      "sun": "*"
    }
  }
  ```

  This is because all internal dependencies are always linked if the version of the internal dependency is within the specified range(which is already enforced by Manypkg), and devDependencies are only relevant in local installs. Having set versions here caused packages to be patched when one of their devDependencies left the range, which was not strictly necessary.

## 0.7.0

### Minor Changes

- 801a468: Add exec command that runs a command in every workspace

## 0.6.0

### Minor Changes

- 2e39bfa: Improve fix for external dependency range mismatches

## 0.5.2

### Patch Changes

- 89d7407: Exit with 0 when checks fail

## 0.5.1

### Patch Changes

- e1874c3: Fix checks not running
- e1874c3: Improve the range chosen by the peer dev dep fixer

## 0.5.0

### Minor Changes

- 594c153: Enable peer and dev dep check

## 0.4.0

### Minor Changes

- 50c7974: Run `yarn` after fixers that require it

## 0.3.0

### Minor Changes

- 0cfe667: Temporarily disable dev and peer dep relationship check

### Patch Changes

- 0cfe667: Fix some cases around getting the highest semver range

## 0.2.0

### Minor Changes

- 9ac6104: Add first implementation of add command

## 0.1.0

### Minor Changes

- 6d5cc67: Initial release
