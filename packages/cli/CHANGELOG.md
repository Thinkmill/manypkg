# @manypkg/cli

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
