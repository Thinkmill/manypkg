---
"@manypkg/cli": minor
---

Add new check: INTERNAL_DEV_DEP_NOT_STAR

This check moves internal devDepencies between packages to be `*` - so in a case where I had a package sunshine, which depends on internal package 'sun':

```json
{
  "name": "sunshine",
  "version": "1.0.0",
  "devDepencies": {
    "sun": "^1.0.0"
  }
}
```

we will now have:

```json
{
  "name": "sunshine",
  "version": "1.0.0",
  "devDepencies": {
    "sun": "*"
  }
}
```

This is because all internal dependencies are always linked, and devDepencies are only relevant in local installs. Having set versions here caused packages to be patched when one of their devDepencies left the range, which was not strictly necessary.
