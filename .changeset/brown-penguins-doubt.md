---
"@manypkg/get-packages": major
---

Initial release of `@manypkg/get-packages`. If you're migrating from `get-workspaces`, the most important changes are:

- getPackages is a named export
- getPackages only accepts a single argument which is the directory to search from
- getPackages returns an object which has `tool`, `packages` and `root`
- getPackages will search up from the directory passed in to find a project root rather than requiring the project root to be passed in
- the package objects no longer have a `name` field and the `config` property has been renamed to `packageJson`

See the README for more information on the new API
