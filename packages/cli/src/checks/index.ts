import EXTERNAL_MISMATCH from "./EXTERNAL_MISMATCH";
import INTERNAL_MISMATCH from "./INTERNAL_MISMATCH";
import INTERNAL_DEV_DEP_NOT_STAR from "./INTERNAL_DEV_DEP_NOT_STAR";
import INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP from "./INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP";
import INVALID_PACKAGE_NAME from "./INVALID_PACKAGE_NAME";
import MULTIPLE_DEPENDENCY_TYPES from "./MULTIPLE_DEPENDENCY_TYPES";
import ROOT_HAS_DEV_DEPENDENCIES from "./ROOT_HAS_DEV_DEPENDENCIES";
import UNSORTED_DEPENDENCIES from "./UNSORTED_DEPENDENCIES";
import INCORRECT_REPOSITORY_FIELD from "./INCORRECT_REPOSITORY_FIELD";

export let checks = [
  EXTERNAL_MISMATCH,
  INTERNAL_MISMATCH,
  INTERNAL_DEV_DEP_NOT_STAR,
  INVALID_DEV_AND_PEER_DEPENDENCY_RELATIONSHIP,
  INVALID_PACKAGE_NAME,
  MULTIPLE_DEPENDENCY_TYPES,
  ROOT_HAS_DEV_DEPENDENCIES,
  UNSORTED_DEPENDENCIES,
  INCORRECT_REPOSITORY_FIELD
];
