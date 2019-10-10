import React from "react";
import { useStaticQuery, graphql } from "gatsby";

const PackagesList = () => {
  const data = useStaticQuery(graphql`
    query PackageList {
      allWorkspaceInfo {
        nodes {
          id
          name
          manifest
        }
      }
    }
  `);
  return (
    <div>
      {data.allWorkspaceInfo.nodes.map(ws => (
        <div key={ws.id}>
          {/*
            TODO: Already, the link not being the name is a problem - need to associate the base url for a ws as a value on it, instead of this.
            I am deliberately not making this a link until we do that
          */}
          {ws.name} @ {ws.manifest.version}
        </div>
      ))}
    </div>
  );
};

export default PackagesList;
