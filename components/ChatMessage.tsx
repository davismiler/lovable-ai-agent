/**
 * Chat message component
 */

import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType, ToolkitConnectionStatus } from "@/types";
import { ConnectionStatusButtons } from "./ConnectionStatusButtons";

interface ChatMessageProps {
  message: ChatMessageType;
  toolkitInfos: Record<string, unknown>;
  connectionStatuses: Record<string, ToolkitConnectionStatus>;
  onConnectToolkit: (toolkitSlug: string) => void;
}

export function ChatMessage({
  message,
  toolkitInfos,
  connectionStatuses,
  onConnectToolkit,
}: ChatMessageProps) {
  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
          message.type === "user"
            ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-violet-500/20"
            : message.type === "system"
            ? "bg-amber-500/10 text-amber-200 border border-amber-500/20 backdrop-blur-sm"
            : message.type === "connection-status"
            ? "bg-gray-900/60 text-gray-100 border border-gray-700/50 backdrop-blur-sm"
            : "bg-gray-900/60 text-gray-100 border border-gray-700/50 backdrop-blur-sm"
        }`}
      >
        <div className="text-[15px] leading-relaxed font-medium prose prose-invert prose-sm max-w-none [&>*]:mb-2 [&>*:last-child]:mb-0 [&_strong]:text-current [&_code]:bg-black/20 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_ul]:pl-4 [&_li]:mb-1">
          <ReactMarkdown
            components={{
              p: ({ children }: { children?: React.ReactNode }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              strong: ({ children }: { children?: React.ReactNode }) => (
                <strong className="font-semibold text-current">
                  {children}
                </strong>
              ),
              code: ({ children }: { children?: React.ReactNode }) => (
                <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono text-current">
                  {children}
                </code>
              ),
              ul: ({ children }: { children?: React.ReactNode }) => (
                <ul className="pl-4 space-y-1">{children}</ul>
              ),
              li: ({ children }: { children?: React.ReactNode }) => (
                <li className="text-current">{children}</li>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Connection Status Buttons */}
        {message.type === "connection-status" && message.data?.toolkits && (
          <ConnectionStatusButtons
            toolkits={message.data.toolkits as Record<string, ToolkitConnectionStatus>}
            toolkitInfos={toolkitInfos}
            connectionStatuses={connectionStatuses}
            onConnectToolkit={onConnectToolkit}
          />
        )}
      </div>
    </div>
  );
}

