# @manypkg/gatsby-source-workspace

> Add information about workspaces in a monorepo to gatsby

## Basic usage

```javascript
// gatsby-config.js

module.exports = {
  plugins: [{ resolve: "@manypkg/gatsby-source-workspace" }],
};
```

This will add the basic workspace information for each pacakge into your gatsby app's graphql. The schema for this is:

```graphql
type workspaceInfo implements Node {
  name: String
  version: String
  dir: String
  relativeDir: String
  packageJSON: JSON!
}
```

Note that the packageJSON field returns a JSON object, and is not queryable at this point. See the extra fields documentation below for how to get specific information from a workspace's `package.json`.

## Options

### Filtering packages

You may not want to add the information from each workspace into your graphql layer, for example you may not want to add private (unpublished) packages in. We accept an option called `workspaceFilter` that is applied as a basic array `filter` to the list of packages to include.

For example, if I wanted to filter out all private packages I could do the following:

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: "@manypkg/gatsby-source-workspace",
      options: {
        workspaceFilter: (workspace) => !workspace.packageJSON.private,
      },
    },
  ],
};
```

Note that this is equivalent to calling `workspaces.filter(workspaceFilter)`, and so cannot be asynchronous.

### Adding extra fields

There are two main use-cases for adding extra fields:

- I want to make additional information in the `package.json` queryable
- I want to add information from elsewhere (such as a readme or changelog) to the `workspaceInfo`

In both cases, we use an option called `extraFields`. The simplest explanation of `extraFields` looks like:

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: "@manypkg/gatsby-source-workspace",
      options: {
        extraFields: [
          {
            name: "license",
            definition: `String`,
          },
        ],
      },
    },
  ],
};
```

This does two things. Firstly, it extends the `workspaceInfo` type in the graphql schema, using the `name` as the name of the field, and the `definition` for the graphql type of the field. The above will leave us with a schema that looks like:

```graphql
type workspaceInfo implements Node {
  name: String
  version: String
  dir: String
  relativeDir: String
  packageJSON: JSON!
  license: String
}
```

Second, when adding information to graphql, it will look at the field in the `package.json` of each package, and lift the data to the top level of `workspaceInfo.

### Adding extra information from elsewhere

As mentioned above, when extending the graphql schema, you may want to read in data from elsewhere. To do this, you can pass a `getFieldInfo` function to an extraFields object. A quick example, if you want to add the contents of the readme as an extra field, you could do it like so:

```javascript
// gatsby-config.js
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  plugins: [
    {
      resolve: "@manypkg/gatsby-source-workspace",
      options: {
        extraFields: [
          {
            name: "readme",
            definition: `String`,
            getFieldInfo: async (ws) =>
              await fs.readFile(path.join(ws.dir, "README.md"), "utf-8"),
          },
        ],
      },
    },
  ],
};
```

Note that this function is asynchronous, so you can do things such as fetch data.
