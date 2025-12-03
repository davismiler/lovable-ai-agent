/**
 * Chat input component
 */

import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  isGenerating = false,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex-shrink-0 p-6 border-t border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe the AI agent you want to build..."
          disabled={disabled || isGenerating}
          className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:bg-gray-900/70 transition-all duration-200 text-[15px] backdrop-blur-sm"
        />
        <button
          onClick={onSend}
          disabled={isGenerating || !value.trim()}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg shadow-violet-500/20"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Building...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Build Agent
            </>
          )}
        </button>
      </div>
    </div>
  );
}

