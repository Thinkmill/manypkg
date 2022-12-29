import { Tool } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { SinglePackageTool } from "./SinglePackageTool";
import { PnpmTool } from "./PnpmTool";
import { RushTool } from "./RushTool";
import { YarnTool } from "./YarnTool";

/**
 * A unique string identifier for each type of supported monorepo tool.
 */
export type ToolType =
  | typeof BoltTool["type"]
  | typeof LernaTool["type"]
  | typeof PnpmTool["type"]
  | typeof RushTool["type"]
  | typeof SinglePackageTool["type"]
  | typeof YarnTool["type"];

/**
 * A convenient mapping of tool type names to tool implementations.
 */
const supportedTools = {
  bolt: BoltTool,
  lerna: LernaTool,
  pnpm: PnpmTool,
  rush: RushTool,
  singlePackage: SinglePackageTool,
  yarn: YarnTool,
} satisfies Record<ToolType, Tool>;

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file scchemas
 * checked last.
 */
const defaultOrder = [
  "yarn",
  "bolt",
  "pnpm",
  "lerna",
  "rush",
  "singlePackage",
] as const satisfies readonly [...ToolType[]];

export * from "./Tool";
export {
  BoltTool,
  LernaTool,
  PnpmTool,
  RushTool,
  SinglePackageTool,
  YarnTool,
  supportedTools,
  defaultOrder,
};
