import React from "react";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";

export default function PageTemplate({ data: { mdx } }) {
  return (
    <div>
      <MDXRenderer>{mdx.body}</MDXRenderer>
    </div>
  );
}

export const pageQuery = graphql`
  query MdxPageQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
    }
  }
`;
