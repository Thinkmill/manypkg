### Publishing a new copy of our fork

Note that for versioning we should retain the original OSS version and add a suffix for any customisations we make.

* If you've just pulled in downstream changes then you'd publish a new suffixed version e.g. if the OSS version is `0.21.4` then we'd use `0.21.4-1`.
* If you've made a new customisation then increment the suffixed version e.g. if the current version is `0.21.4-1` then you'd use `0.21.4-2` next.

To publish this Atlassian fork run the following commands:

1. `atlas packages permission grant -u {{staffid}}` to grant publishing writes within Artifactory
2. `yarn preconstruct build` to generate the dist
3. `cd packages/cli/` to navigate into the CLI workspace
4. `npm version {{version}}` to increment the version
5. `npm publish` to upload to artifactory
6. Discard the git diff generated for `yarn.lock` and `package-lock.json`.
7. Commit the updated version number within `packages/cli/package.json`.
