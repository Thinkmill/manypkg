---
"@manypkg/cli": minor
---

Changed peer and dev dependency relationship check to only require that the upper bound of the dev dep range is within the peer dep range so that cases where the dev dep range allows versions lower than the lower bound of such as a peer dep with `^1.0.0` and dev dep with `*` are allowed and this fixes the regression in 0.8.1 where cases that should have been fine weren't like a peer dep with `^1.0.0` and a dev dep with `^1.1.0`
