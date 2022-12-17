import { Tool, ToolType } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { NoneTool } from "./NoneTool";
import { PnpmTool } from "./PnpmTool";
import { RushTool } from "./RushTool";
import { YarnTool } from "./YarnTool";

/**
 * A convenient mapping of tool type names to tool implementations.
 */
const supportedTools: Record<ToolType, Tool> = {
    bolt: BoltTool,
    lerna: LernaTool,
    none: NoneTool,
    pnpm: PnpmTool,
    rush: RushTool,
    yarn: YarnTool
};

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file scchemas
 * checked last.
 *
 * The "none" tool (a standard package with no monorepo implementation) is
 * not included in the default sort order.
 */
const defaultOrder: ToolType[] = ["yarn", "bolt", "pnpm", "lerna", "rush"];

export * from "./Tool";
export {
    BoltTool,
    LernaTool,
    NoneTool,
    PnpmTool,
    RushTool,
    YarnTool,
    supportedTools,
    defaultOrder
};
