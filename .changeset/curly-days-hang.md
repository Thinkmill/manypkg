---
"@manypkg/find-root": major
---

The `find-root` package now returns a new `MonorepoRoot` interface, instead of a string. This interface provides a `rootDir` for the discovered monorepo, and a `tool` object, which is an object using the new `Tool` interface provided by `@manypkg/tools`.
