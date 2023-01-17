---
"@manypkg/get-packages": major
---

The `get-packages` package now returns a slightly different structure. The old `tool` string has been replaced with a `tool` object, using the new `Tool` interface provided by `@manypkg/tools`. Each `Package` now contains both the absolute directory and relative directory path. Last, the `root` package has been renamed `rootPackage` and is optional, to support monorepos that do not contain a root package.
