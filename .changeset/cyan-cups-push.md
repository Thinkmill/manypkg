---
"@manypkg/cli": minor
---

Add new check: INTERNAL_DEV_DEP_NOT_STAR

This check moves internal devDependencies between packages to be `*` - so in a case where I had a package sunshine, which depends on internal package 'sun':

```json
{
  "name": "sunshine",
  "version": "1.0.0",
  "devDependencies": {
    "sun": "^1.0.0"
  }
}
```

we will now have:

```json
{
  "name": "sunshine",
  "version": "1.0.0",
  "devDependencies": {
    "sun": "*"
  }
}
```

This is because all internal dependencies are always linked if the version of the internal dependency is within the specified range(which is already enforced by Manypkg), and devDependencies are only relevant in local installs. Having set versions here caused packages to be patched when one of their devDependencies left the range, which was not strictly necessary.
