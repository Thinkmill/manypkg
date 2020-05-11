---
"@manypkg/cli": minor
---

Remove check requiring that all devDependencies must be `*`. This has been removed because pre-release versions are not satisfied by `*` which means that you previously couldn't use Manypkg, have internal devDependencies and have pre-releases
