import React from "react";
import { useStaticQuery, graphql } from "gatsby";

const FunTimes = () => {
  const data = useStaticQuery(graphql`
    query ThisQuery {
      allWorkspaceInfo {
        edges {
          node {
            id
            name
            version
          }
        }
      }
    }
  `);
  console.warn(data);
  return (
    <div>
      {data.allWorkspaceInfo.edges.map(ws => (
        <div id={ws.node.id}>
          {ws.node.name} @ {ws.node.version}
        </div>
      ))}
    </div>
  );
};

export default FunTimes;
