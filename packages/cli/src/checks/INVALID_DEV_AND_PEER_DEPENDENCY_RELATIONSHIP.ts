import { makeCheck, getHighestExternalRanges } from "./utils";
import { contains } from "sembear";
import { Workspace } from "get-workspaces";

type ErrorType = {
  type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
  workspace: Workspace;
  peerVersion: string;
  dependencyName: string;
  devVersion: string | null;
  idealDevVersion: string;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: (workspace, allWorkspaces) => {
    let errors: ErrorType[] = [];
    let peerDeps = workspace.config.peerDependencies;
    let devDeps = workspace.config.devDependencies || {};
    if (peerDeps) {
      for (let depName in peerDeps) {
        if (!devDeps[depName]) {
          let highestRanges = getHighestExternalRanges(allWorkspaces);
          let idealDevVersion = highestRanges.get(depName);
          if (idealDevVersion === undefined) {
            idealDevVersion = peerDeps[depName];
          }

          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace,
            peerVersion: peerDeps[depName],
            dependencyName: depName,
            devVersion: null,
            idealDevVersion
          });
        } else if (!contains(peerDeps[depName], devDeps[depName])) {
          let highestRanges = getHighestExternalRanges(allWorkspaces);
          let idealDevVersion = highestRanges.get(depName);
          if (idealDevVersion === undefined) {
            idealDevVersion = peerDeps[depName];
          }
          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace,
            dependencyName: depName,
            peerVersion: peerDeps[depName],
            devVersion: devDeps[depName],
            idealDevVersion
          });
        }
      }
    }
    return errors;
  },
  fix: error => {
    if (!error.workspace.config.devDependencies) {
      error.workspace.config.devDependencies = {};
    }
    error.workspace.config.devDependencies[error.dependencyName] =
      error.idealDevVersion;
    return { requiresInstall: true };
  },
  print: error => {
    if (error.devVersion === null) {
      return `${error.workspace.name} has a peerDependency on ${error.dependencyName} but it is not also specified in devDependencies, please add it there.`;
    }
    return `${error.workspace.name} has a peerDependency on ${error.dependencyName} but the range specified in devDependency is not greator than or equal to the range specified in peerDependencies`;
  }
});
