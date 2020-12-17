---
"@manypkg/cli": minor
---

Added the ability to use the exact package or directory name to target a package that is a substring of another with for the `run` command:

If packages exist at `packages/pkg-a` and `packages/pkg-a-1`, target `pkg-a` using the exact directory name:

```bash
yarn manypkg run packages/pkg-a
```

If packages are named `@project/package-a` and `@project/package-a-1`, target `package-a` using the exact package name:

```bash
yarn manypkg run @project/package-a
```
