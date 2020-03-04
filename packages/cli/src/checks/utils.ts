import { Workspace } from "get-workspaces";
import { highest } from "sembear";

export const NORMAL_DEPENDENCY_TYPES = [
  "dependencies",
  "devDependencies",
  "optionalDependencies"
] as const;

export const DEPENDENCY_TYPES = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies"
] as const;

type RootCheck<ErrorType> = {
  type: "root";
  validate: (
    rootWorkspace: Workspace,
    allWorkspaces: Map<string, Workspace>
  ) => ErrorType[];
  fix?: (error: ErrorType) => void | { requiresInstall: boolean };
  print: (error: ErrorType) => string;
};

type RootCheckWithFix<ErrorType> = {
  type: "root";
  validate: (
    rootWorkspace: Workspace,
    allWorkspaces: Map<string, Workspace>
  ) => ErrorType[];
  fix: (error: ErrorType) => void | { requiresInstall: boolean };
  print: (error: ErrorType) => string;
};

type AllCheck<ErrorType> = {
  type: "all";
  validate: (
    workspace: Workspace,
    allWorkspaces: Map<string, Workspace>,
    rootWorkspace: Workspace
  ) => ErrorType[];
  fix?: (error: ErrorType) => void | { requiresInstall: boolean };
  print: (error: ErrorType) => string;
};

type AllCheckWithFix<ErrorType> = {
  type: "all";
  validate: (
    workspace: Workspace,
    allWorkspaces: Map<string, Workspace>,
    rootWorkspace: Workspace
  ) => ErrorType[];
  fix: (error: ErrorType) => void | { requiresInstall: boolean };
  print: (error: ErrorType) => string;
};

export type Check<ErrorType> =
  | RootCheck<ErrorType>
  | AllCheck<ErrorType>
  | RootCheckWithFix<ErrorType>
  | AllCheckWithFix<ErrorType>;

export function sortObject(prevObj: { [key: string]: string }) {
  let newObj: { [key: string]: string } = {};

  for (let key of Object.keys(prevObj).sort()) {
    newObj[key] = prevObj[key];
  }
  return newObj;
}

export function sortDeps(workspace: Workspace) {
  for (let depType of DEPENDENCY_TYPES) {
    let prevDeps = workspace.config[depType];
    if (prevDeps) {
      workspace.config[depType] = sortObject(prevDeps);
    }
  }
}

export type Workspace = Workspace;

function weakMemoize<Arg, Ret>(func: (arg: Arg) => Ret): (arg: Arg) => Ret {
  let cache = new WeakMap<any, any>();
  // @ts-ignore
  return arg => {
    if (cache.has(arg)) {
      // $FlowFixMe
      return cache.get(arg);
    }
    let ret = func(arg);
    cache.set(arg, ret);
    return ret;
  };
}

export let getHighestExternalRanges = weakMemoize(function getHighestVersions(
  allWorkspaces: Map<string, Workspace>
) {
  let highestExternalRanges = new Map<string, string>();
  for (let [pkgName, workspace] of allWorkspaces) {
    for (let depType of NORMAL_DEPENDENCY_TYPES) {
      let deps = workspace.config[depType];
      if (deps) {
        for (let depName in deps) {
          if (!allWorkspaces.has(depName)) {
            let highestExternalRange = highestExternalRanges.get(depName);
            if (
              !highestExternalRange ||
              highest([highestExternalRange, deps[depName]]) === deps[depName]
            ) {
              highestExternalRanges.set(depName, deps[depName]);
            }
          }
        }
      }
    }
  }
  return highestExternalRanges;
});

export function versionRangeToRangeType(versionRange: string) {
  if (versionRange.charAt(0) === "^") return "^";
  if (versionRange.charAt(0) === "~") return "~";
  return "";
}

export function isArrayEqual(arrA: Array<string>, arrB: Array<string>) {
  for (var i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
}

function makeCheck<ErrorType>(
  check: RootCheckWithFix<ErrorType>
): RootCheckWithFix<ErrorType>;
function makeCheck<ErrorType>(
  check: AllCheckWithFix<ErrorType>
): AllCheckWithFix<ErrorType>;
function makeCheck<ErrorType>(
  check: RootCheck<ErrorType>
): RootCheck<ErrorType>;
function makeCheck<ErrorType>(check: AllCheck<ErrorType>): AllCheck<ErrorType>;
function makeCheck<ErrorType>(
  check: RootCheck<ErrorType> | AllCheck<ErrorType>
): RootCheck<ErrorType> | AllCheck<ErrorType> {
  return check;
}

export { makeCheck };
