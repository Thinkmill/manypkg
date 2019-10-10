# Currently we are using this to test some gatsby plugins + work

What we want:

To be able to generate the following pages in a gatsby site on a per-workspace basis

/packages // index list of packages
/packages/:package-name // render the docs/README.md || README.md
/packages/:package-name/docs // index list of docs pages in the package (hidden in nav, but here for url hackers)
/packages/:package-name/docs/:some-file // render the docs file of the appropriate name
/packages/:package-name/arbitrary-page // a file from /docs that has frontmatter specifying a path

Some other notes:

We want the first part of the path to be configurable
We want to correct relative links into absolute links (because relative links are the worst)
related: correct links to files to links to their website location (removing pathname etc)

Navigation data should be trivial to get

## Second plugin

I want to make a second plugin called `gatsby-source-workspace-deep` (something like this, need another better word).
This should wrap `gatsby-source-worskpace` and then use [onCreateNode](https://www.gatsbyjs.org/docs/node-apis/#onCreateNode)
to modify the workspace schema to populate information from the package.json.

Bonus: It would be good to allow users to extend their own `package.json` fields easily, so we have a standard, but also add stuff you want.

I'm probably going to add some config for the page-generator of the website into individual package.jsons so they can control some stuff,
as well as the config in the page-generator plugin itself

Derived fields I want in the secondPlugin

- tidyName:: the package name with the scope removed (trust me people will want this)
- wsBaseUrl:: This is currently calculated in this package's gatsby-node. I think it would be better to store it in the graphql on the workspace. This also cirumvents needing a list of pages under the package, as you can use matching to match against the `wsBaseUrl`

The `/packages` path should be in the site's meta.
