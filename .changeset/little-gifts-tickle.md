---
"@manypkg/cli": minor
---

Add package.json#manypkg config object:

```
{
  "manypkg": {}
}
```

To support setting a default branch for the INCORRECT_REPOSITORY_FIELD check/fix, a new config option can be set:

```
{
  "manypkg": {
    "defaultBranch": "master"
  }
}
```

The default `defaultBranch` is `"master"`.
