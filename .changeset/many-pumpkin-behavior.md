---
"@manypkg/find-root": patch
---

The `findRoot` and `findRootSync` methods now take an optional list of `Tool` implementations, allowing the caller to restrict the desired types of monorepo discovered, or provide a custom monorepo tool implementation.
