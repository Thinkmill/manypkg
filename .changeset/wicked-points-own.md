---
"@manypkg/cli": minor
---

Change the `ROOT_HAS_DEV_DEPENDENCIES` rule to `ROOT_HAS_PROD_DEPENDENCIES`. Monorepo root should use `devDependencies` instead of `dependencies` for better support of production-only installs, useful in eg Docker builds.
