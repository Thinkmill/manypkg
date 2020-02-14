---
"@manypkg/cli": minor
---

Added `manypkg run` which can be used to execute scripts for packages within a monorepo.

For instance, there are two packages: package-a and package-b. Assuming these packages are located within a packages/ directory at the root and include a start script, `manypkg run` can be used to execute these scripts at the root level.

Examples

- yarn manypkg run <folder_name> <script_name>
- yarn manypkg run hello-world start
