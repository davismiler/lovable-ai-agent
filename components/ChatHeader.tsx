/**
 * Chat header component
 */

import { Sparkles } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="flex-shrink-0 px-6 py-5 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            AI Agent Builder
          </h1>
          <p className="text-sm text-gray-400">
            Build intelligent agents with custom interfaces
          </p>
        </div>
      </div>
    </div>
  );
}

