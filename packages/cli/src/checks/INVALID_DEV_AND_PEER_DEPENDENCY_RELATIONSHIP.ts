import { makeCheck, Workspace } from "./utils";
import * as semver from "semver";

type ErrorType = {
  type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
  workspace: Workspace;
  peerVersion: string;
  dependencyName: string;
  devVersion: string | null;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: workspace => {
    let errors: ErrorType[] = [];
    let peerDeps = workspace.config.peerDependencies;
    let devDeps = workspace.config.devDependencies || {};
    if (peerDeps) {
      for (let depName in peerDeps) {
        if (!devDeps[depName]) {
          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace,
            peerVersion: peerDeps[depName],
            dependencyName: depName,
            devVersion: null
          });
        } else if (
          // TODO: this is wrong
          // it should be is devDeps[depName] a subset of peerDeps[depName]
          // but that function doesn't exist yet
          // so this check is disabled for now
          !semver.gte(devDeps[depName], peerDeps[depName])
        ) {
          errors.push({
            type: "INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP",
            workspace,
            dependencyName: depName,
            peerVersion: peerDeps[depName],
            devVersion: devDeps[depName]
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
    error.workspace.config.devDependencies[
      error.dependencyName
    ] = error.workspace.config.peerDependencies![error.dependencyName];
  },
  print: error => {
    if (error.devVersion === null) {
      return `${error.workspace.name} has a peerDependency on ${error.dependencyName} but it is not also specified in devDependencies, please add it there.`;
    }
    return `${error.workspace.name} has a peerDependency on ${error.dependencyName} but the range specified in devDependency is not greator than or equal to the range specified in peerDependencies`;
  }
});
