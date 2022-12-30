---
"@manypkg/find-root": major
"@manypkg/get-packages": major
"@manypkg/cli": minor
"@manypkg/tools": minor
---

Release a new API for monorepo tools

 - The `find-root` package now returns a `MonorepoRoot` interface, instead of a string. This
   interface provides both a `rootDir` for the discovered monorepo, and a `tool`, representing
   the monorepo tool that was discovered.
 - The `get-packages` package now returns a slightly different structure. The old `tool` string
   is replaced with the `tool` object above, and each `Package` now contains both the absolute
   directory and a relative directory path. The `root` package has been renamed `rootPackage`
   and is now optional, to support monorepos that do not contain a root package.

