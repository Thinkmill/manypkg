import { makeCheck, DEPENDENCY_TYPES, sortDeps, isArrayEqual } from "./utils";
import { Package } from "@manypkg/get-packages";

type ErrorType = {
  type: "UNSORTED_DEPENDENCIES";
  workspace: Package;
};

export default makeCheck<ErrorType>({
  type: "all",
  validate: (workspace) => {
    for (let depType of DEPENDENCY_TYPES) {
      let deps = workspace.packageJson[depType];
      if (deps && !isArrayEqual(Object.keys(deps), Object.keys(deps).sort())) {
        return [
          {
            type: "UNSORTED_DEPENDENCIES",
            workspace,
          },
        ];
      }
    }
    return [];
  },
  fix: (error) => {
    sortDeps(error.workspace);
  },
  print: (error) =>
    `${error.workspace.packageJson.name}'s dependencies are unsorted, this can cause large diffs when packages are added, resulting in dependencies being sorted`,
});
