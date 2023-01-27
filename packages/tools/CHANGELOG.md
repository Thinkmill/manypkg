# @manypkg/tools

## 1.0.0
### Major Changes



- [#151](https://github.com/Thinkmill/manypkg/pull/151) [`a01efc9`](https://github.com/Thinkmill/manypkg/commit/a01efc9c25900b7d21b6d517a2021b021f8b3922) Thanks [@elliot-nelson](https://github.com/elliot-nelson)! - Introduces a new `Tool` API that provides key functions related to a specific implementation of a monorepo, like `isMonorepoRoot` and `getPackages`. Existing tool implementations in manypkg have been converted to use this new interface.
