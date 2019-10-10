import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";

const FunTimes = () => {
  const { allSitePage } = useStaticQuery(graphql`
    query ThisQuery {
      allSitePage {
        nodes {
          path
        }
      }
    }
  `);
  return (
    <div>
      <h1>Welcome!</h1>
      <p>
        I'm building all this as experiments in using gatsby to programmatically
        generate this stuff. Here's a list of the pages we have generated so
        far:
      </p>
      <ul>
        {allSitePage.nodes.map(({ path }) => (
          <li key={path}>
            <Link to={path}>{path}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FunTimes;
