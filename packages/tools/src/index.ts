import { Tool, ToolType } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { PnpmTool } from "./PnpmTool";
import { RootTool } from "./RootTool";
import { RushTool } from "./RushTool";
import { YarnTool } from "./YarnTool";

/**
 * A convenient mapping of tool type names to tool implementations.
 */
const supportedTools: Record<ToolType, Tool> = {
  bolt: BoltTool,
  lerna: LernaTool,
  pnpm: PnpmTool,
  root: RootTool,
  rush: RushTool,
  yarn: YarnTool,
};

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file scchemas
 * checked last.
 */
const defaultOrder: ToolType[] = [
  "yarn",
  "bolt",
  "pnpm",
  "lerna",
  "root",
  "rush",
];

export * from "./Tool";
export {
  BoltTool,
  LernaTool,
  PnpmTool,
  RootTool,
  RushTool,
  YarnTool,
  supportedTools,
  defaultOrder,
};
