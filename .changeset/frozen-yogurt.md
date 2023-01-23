---
"@manypkg/tools": major
---

Introduces a new `Tool` API that provides key functions related to a specific implementation of a monorepo, like `isMonorepoRoot` and `getPackages`. Existing tool implementations in manypkg have been converted to use this new interface.
