/**
 * Preview header component
 */

import { RefreshCw } from "lucide-react";

interface PreviewHeaderProps {
  onReload: () => void;
}

export function PreviewHeader({ onReload }: PreviewHeaderProps) {
  return (
    <div className="flex-shrink-0 px-6 py-5 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Live Preview
          </h2>
          <p className="text-sm text-gray-400">
            Your generated agent interface
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReload}
            className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-700/50"
            title="Reload iframe"
          >
            <RefreshCw className="w-3 h-3" />
            Reload
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}

