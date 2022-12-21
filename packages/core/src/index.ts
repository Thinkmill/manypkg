import { Tool, ToolType } from "./Tool";
import { BoltTool } from "./BoltTool";
import { LernaTool } from "./LernaTool";
import { SinglePackageTool } from "./SinglePackageTool";
import { PnpmTool } from "./PnpmTool";
import { RushTool } from "./RushTool";
import { YarnTool } from "./YarnTool";

/**
 * A convenient mapping of tool type names to tool implementations.
 */
const supportedTools: Record<ToolType, Tool> = {
    bolt: BoltTool,
    lerna: LernaTool,
    pnpm: PnpmTool,
    rush: RushTool,
    singlePackage: SinglePackageTool,
    yarn: YarnTool
};

/**
 * A default ordering for monorepo tool checks.
 *
 * This ordering is designed to check the most typical package.json-based
 * monorepo implementations first, with tools based on custom file scchemas
 * checked last.
 */
const defaultOrder: ToolType[] = ["yarn", "bolt", "pnpm", "lerna", "rush", "singlePackage"];

export * from "./Tool";
export {
    BoltTool,
    LernaTool,
    PnpmTool,
    RushTool,
    SinglePackageTool,
    YarnTool,
    supportedTools,
    defaultOrder
};
