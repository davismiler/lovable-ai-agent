/**
 * Connection status buttons component
 */

import type { ToolkitConnectionStatus } from "@/types";

interface ConnectionStatusButtonsProps {
  toolkits: Record<string, ToolkitConnectionStatus>;
  toolkitInfos: Record<string, unknown>;
  connectionStatuses: Record<string, ToolkitConnectionStatus>;
  onConnectToolkit: (toolkitSlug: string) => void;
}

interface ToolkitInfo {
  name?: string;
}

export function ConnectionStatusButtons({
  toolkits,
  toolkitInfos,
  connectionStatuses,
  onConnectToolkit,
}: ConnectionStatusButtonsProps) {
  return (
    <div className="mt-5 space-y-3">
      {Object.entries(toolkits).map(([toolkitSlug, status]) => {
        const toolkit = toolkitInfos[toolkitSlug] as ToolkitInfo | undefined;
        const currentStatus = connectionStatuses[toolkitSlug] || status;

        return (
          <div
            key={toolkitSlug}
            className="flex items-center justify-between bg-gray-800/40 rounded-xl p-4 border border-gray-700/30"
          >
            <div className="flex-1">
              <div className="font-semibold text-white text-sm">
                {toolkit?.name || toolkitSlug}
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${
                    currentStatus?.isComposioManaged
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {currentStatus?.isComposioManaged ? "●" : "◐"}{" "}
                  {currentStatus?.isComposioManaged ? "Managed" : "Custom"}
                </span>
                <span className="text-gray-500">•</span>
                <span>{currentStatus?.authScheme || "unknown"}</span>
              </div>
            </div>
            <button
              onClick={() => onConnectToolkit(toolkitSlug)}
              disabled={currentStatus?.status === "connecting"}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentStatus?.connected
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-default"
                  : currentStatus?.status === "connecting"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 cursor-not-allowed"
                  : "bg-violet-500/15 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 hover:border-violet-500/30"
              }`}
            >
              {currentStatus?.connected
                ? "✓ Connected"
                : currentStatus?.status === "connecting"
                ? "⏳ Connecting..."
                : "Connect"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

