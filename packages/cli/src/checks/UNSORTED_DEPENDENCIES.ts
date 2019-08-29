import {
  makeCheck,
  Workspace,
  DEPENDENCY_TYPES,
  sortDeps,
  isArrayEqual
} from "./utils";

type ErrorType = {
  type: "UNSORTED_DEPENDENCIES";
  workspace: Workspace;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: workspace => {
    for (let depType of DEPENDENCY_TYPES) {
      let deps = workspace.config[depType];
      if (deps && !isArrayEqual(Object.keys(deps), Object.keys(deps).sort())) {
        return [
          {
            type: "UNSORTED_DEPENDENCIES",
            workspace
          }
        ];
      }
    }
    return [];
  },
  fix: error => {
    sortDeps(error.workspace);
  },
  print: error =>
    `${
      error.workspace.name
    }'s dependencies are unsorted, this can cause large diffs when packages are added, resulting in dependencies being sorted`
});
