---
"@manypkg/get-packages": patch
---

The `getPackages` and `getPackagesSync` methods now take an optional list of `Tool` implementations, allowing the caller to restrict the desired types of monorepo discovered, or provide a custom monorepo tool implementation.
