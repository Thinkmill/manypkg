---
"@manypkg/cli": minor
---

Add repository field check which checks if a GitHub repo URL is in the `repository` field in the root `package.json` and if it is, checks that all of the packages have a `repository` field which goes into the directory of the package.
