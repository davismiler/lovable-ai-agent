"use client";

import { useState, useRef } from "react";
import type {
  GeneratedCode,
  CredentialCollection,
  ToolkitConnectionStatus,
  ToolkitInfo,
} from "@/types";
import { useUserId } from "@/hooks/useUserId";
import { useMessages } from "@/hooks/useMessages";
import { API_ENDPOINTS, OAUTH_TIMEOUT } from "@/constants";
import {
  extractToolkitName,
  processFrontendCode,
  createIframeShims,
  injectShims,
  formatToolName,
  getAuthType,
  getManagedStatus,
} from "@/lib/utils";
import { createConnectionStatus } from "@/lib/toolkit";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { CredentialForm } from "@/components/CredentialForm";
import { ChatInput } from "@/components/ChatInput";
import { PreviewHeader } from "@/components/PreviewHeader";

export default function Home() {
  const [agentIdea, setAgentIdea] = useState("");
  const userId = useUserId();
  const { messages, addMessage, messagesEndRef } = useMessages();
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolkitInfos, setToolkitInfos] = useState<
    Record<string, ToolkitInfo>
  >({});
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, ToolkitConnectionStatus>
  >({});
  const [, setIsCheckingConnections] = useState(false);
  const [credentialCollection, setCredentialCollection] =
    useState<CredentialCollection | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to reload only the iframe
  const reloadIframe = () => {
    if (iframeRef.current) {
      try {
        const currentSrc = iframeRef.current.src;

        // If it's a blob URL, we need to regenerate the content
        if (currentSrc.startsWith("blob:")) {
          // Revoke the old blob URL to free memory
          URL.revokeObjectURL(currentSrc);

          // Regenerate the iframe content if we have generated code
          if (generatedCode) {
            const cleanFrontend = processFrontendCode(
              generatedCode.frontend,
              userId
            );
            const shims = createIframeShims();
            const shimmedFrontend = injectShims(cleanFrontend, shims);

            // Render via srcdoc to avoid blob restrictions
            if (iframeRef.current) {
              iframeRef.current.removeAttribute("src");
              (iframeRef.current as HTMLIFrameElement & { srcdoc: string }).srcdoc =
                shimmedFrontend;
            }

            console.log("Updated iframe with AI-generated code");
          }
        } else if (currentSrc.includes("/api/preview")) {
          // For API preview URLs, just reload
          iframeRef.current.src = currentSrc + "&t=" + Date.now();
        } else {
          // For other URLs, just reload
          iframeRef.current.src = currentSrc;
        }
      } catch (error) {
        console.error("Error reloading iframe:", error);
        // Fallback: reset to default preview
        if (iframeRef.current) {
          iframeRef.current.src = "/api/preview?type=default&t=" + Date.now();
        }
      }
    }
  };

  const handleGenerateAgent = async () => {
    if (!agentIdea.trim()) return;

    setIsGenerating(true);

    // Add user message
    addMessage({
      type: "user",
      content: agentIdea,
    });

    // Add assistant thinking message
    addMessage({
      type: "assistant",
      content:
        "I'll create an AI agent for you. Let me analyze your requirements and generate the code...",
    });

    try {
      const response = await fetch(API_ENDPOINTS.GENERATE_AGENT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentIdea }),
      });

      if (response.ok) {
        const code = await response.json();
        setGeneratedCode(code);

        // Add success message with details
        addMessage({
          type: "assistant",
          content: `Great! I've created your "${code.useCase}" agent. Here's what I built:

**Features:**
${code.discoveredTools.map((tool: string) => `• ${formatToolName(tool)}`).join("\n")}

**System Capabilities:**
• Frontend interface with input fields for API keys and prompts
• Backend AI agent powered by Vercel AI SDK
• Integration with ${code.discoveredTools.length} Composio tools
• Real-time response streaming

The agent is now ready for testing on the right side!`,
          data: { type: "generation-complete", code },
        });

        // Check for required connections
        if (code.discoveredTools && code.discoveredTools.length > 0) {
          checkToolkitConnections(code.discoveredTools);
        }

        // Update iframe with generated frontend
        if (iframeRef.current) {
          // Clean up any existing blob URL to prevent memory leaks
          if (
            iframeRef.current.src &&
            iframeRef.current.src.startsWith("blob:")
          ) {
            URL.revokeObjectURL(iframeRef.current.src);
          }

          const cleanFrontend = processFrontendCode(code.frontend, userId);
          const shims = createIframeShims();
          const shimmedFrontend = injectShims(cleanFrontend, shims);

          // Render via srcdoc to avoid blob restrictions
          if (iframeRef.current) {
            iframeRef.current.removeAttribute("src");
            (iframeRef.current as HTMLIFrameElement & { srcdoc: string }).srcdoc =
              shimmedFrontend;
          }

          console.log("Updated iframe with AI-generated code");
        }

        setAgentIdea("");
      } else {
        throw new Error("Failed to generate agent");
      }
    } catch (error) {
      addMessage({
        type: "assistant",
        content:
          "I encountered an error while generating your agent. Please try again with a different description.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkToolkitConnections = async (tools: string[]) => {
    setIsCheckingConnections(true);

    addMessage({
      type: "system",
      content: "Checking required toolkit connections...",
    });

    try {
      const uniqueToolkits = [...new Set(tools.map(extractToolkitName))];

      const toolkitPromises = uniqueToolkits.map(async (toolkitSlug) => {
        try {
          const response = await fetch(API_ENDPOINTS.TOOLKIT_INFO, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              slug: toolkitSlug,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            return { toolkitSlug, toolkit: data.toolkit as ToolkitInfo };
          } else {
            return { toolkitSlug, toolkit: null };
          }
        } catch (error) {
          return { toolkitSlug, toolkit: null };
        }
      });

      const toolkitResults = await Promise.all(toolkitPromises);

      const newToolkitInfos: Record<string, ToolkitInfo> = {};
      const newConnectionStatuses: Record<string, ToolkitConnectionStatus> =
        {};
      const connectionItems: string[] = [];

      toolkitResults.forEach(({ toolkitSlug, toolkit }) => {
        if (toolkit) {
          newToolkitInfos[toolkitSlug] = toolkit;
          const status = createConnectionStatus(toolkit, toolkitSlug);
          newConnectionStatuses[toolkitSlug] = status;

          const authType = getAuthType(status);
          const managedStatus = getManagedStatus(status.isComposioManaged ?? false);
          connectionItems.push(
            `**${toolkit.name}** - ${authType} (${managedStatus})`
          );
        }
      });

      setToolkitInfos(newToolkitInfos);
      setConnectionStatuses(newConnectionStatuses);

      // Add connection status message
      addMessage({
        type: "connection-status",
        content: `**Required Connections:**

${connectionItems.join("\n")}

Connect these services to enable your agent's full functionality:`,
        data: { toolkits: newConnectionStatuses },
      });
    } catch (error) {
      console.error("Error checking toolkit connections:", error);
    } finally {
      setIsCheckingConnections(false);
    }
  };

  const handleCredentialSubmit = async () => {
    if (!credentialCollection) return;

    const { toolkitSlug, authType, credentials } = credentialCollection;
    const toolkit = toolkitInfos[toolkitSlug];

    try {
      addMessage({
        type: "system",
        content: `Connecting ${toolkit?.name || toolkitSlug}...`,
      });

      // Clear the credential collection UI
      setCredentialCollection(null);

      const response = await fetch(API_ENDPOINTS.CREATE_CONNECTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolkitSlug,
          authType,
          credentials,
          userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (authType === "oauth2" && data.redirectUrl) {
          // For OAuth2, open redirect URL and wait for connection
          setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
            ...prev,
            [toolkitSlug]: { ...prev[toolkitSlug], status: "connecting" },
          }));

          window.open(data.redirectUrl, "_blank");
          if (data.connectionId) {
            waitForOAuthConnection(data.connectionId, toolkitSlug);
          }
        } else {
          // For API key, connection should be immediate
          setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
            ...prev,
            [toolkitSlug]: {
              ...prev[toolkitSlug],
              connected: true,
              status: "connected",
            },
          }));

          addMessage({
            type: "system",
            content: `✅ ${toolkit?.name || toolkitSlug} connected successfully!`,
          });
        }
      } else {
        throw new Error(data.error || "Connection failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addMessage({
        type: "system",
        content: `❌ Failed to connect ${toolkit?.name || toolkitSlug}: ${errorMessage}`,
      });
    }
  };

  const connectToolkit = async (toolkitSlug: string) => {
    const toolkit = toolkitInfos[toolkitSlug];
    const status = connectionStatuses[toolkitSlug];
    if (!toolkit || !status) return;

    try {
      if (status.isComposioManaged && status.isOAuth2) {
        // Composio-managed OAuth2 - direct redirect
        addMessage({
          type: "system",
          content: `Initiating OAuth connection for ${toolkit.name}... Please authorize in the popup window.`,
        });

        const response = await fetch(API_ENDPOINTS.CREATE_CONNECTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolkitSlug,
            authType: "oauth2",
            userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.redirectUrl && data.connectionId) {
        setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
          ...prev,
          [toolkitSlug]: { ...prev[toolkitSlug], status: "connecting" },
        }));

            window.open(data.redirectUrl, "_blank");
            waitForOAuthConnection(data.connectionId, toolkitSlug);
          } else if (data.connectionId) {
            // Existing connection was found, directly update the status
            setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
              ...prev,
              [toolkitSlug]: {
                ...prev[toolkitSlug],
                connected: true,
                status: "connected",
                connectionId: data.connectionId,
              },
            }));
            addMessage({
              type: "system",
              content: `🎉 ${toolkit?.name || toolkitSlug} is already connected! Your agent can now use this service.`,
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("OAuth connection failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(
            `Failed to initiate OAuth connection: ${errorData.error || response.statusText}`
          );
        }
      } else if (status.isComposioManaged && status.isApiKey) {
        // Composio-managed API key - show input form
        setCredentialCollection({
          isCollecting: true,
          toolkitSlug,
          authType: "api_key",
          credentials: {},
        });
      } else if (!status.isComposioManaged && status.isOAuth2) {
        // Non-Composio managed OAuth2 - collect client ID and secret
        setCredentialCollection({
          isCollecting: true,
          toolkitSlug,
          authType: "oauth2",
          credentials: {},
        });
      } else if (!status.isComposioManaged && status.isApiKey) {
        // Non-Composio managed API key - show input form
        setCredentialCollection({
          isCollecting: true,
          toolkitSlug,
          authType: "api_key",
          credentials: {},
        });
      } else {
        // Unsupported authentication scheme
        addMessage({
          type: "system",
          content: `${toolkit.name} authentication (${status.authScheme}) is not yet supported in this interface.`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error connecting toolkit:", error);
      addMessage({
        type: "system",
        content: `❌ Failed to connect ${toolkit.name}: ${errorMessage}`,
      });
    }
  };

  const waitForOAuthConnection = async (
    connectionId: string,
    toolkitSlug: string
  ) => {
    try {
      const response = await fetch(API_ENDPOINTS.WAIT_FOR_CONNECTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId,
          timeout: OAUTH_TIMEOUT,
        }),
      });

      const data = await response.json();
      const toolkit = toolkitInfos[toolkitSlug];

      if (data.success && data.status === "ACTIVE") {
        setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
          ...prev,
          [toolkitSlug]: {
            ...prev[toolkitSlug],
            connected: true,
            status: "connected",
            connectionId: connectionId,
          },
        }));

        addMessage({
          type: "system",
          content: `🎉 ${toolkit?.name || toolkitSlug} connected successfully! Your agent can now use this service.`,
        });
      } else if (data.status === "EXPIRED" || data.status === "INACTIVE") {
        setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
          ...prev,
          [toolkitSlug]: {
            ...prev[toolkitSlug],
            status: "not_connected",
          },
        }));

        addMessage({
          type: "system",
          content: `❌ OAuth connection for ${toolkit?.name || toolkitSlug} ${data.status.toLowerCase()}. Please try connecting again.`,
        });
      } else if (data.status === "TIMEOUT") {
        setConnectionStatuses((prev) => ({
          ...prev,
          [toolkitSlug]: {
            ...prev[toolkitSlug],
            status: "not_connected",
          },
        }));

        addMessage({
          type: "system",
          content: `⏰ OAuth connection for ${toolkit?.name || toolkitSlug} timed out. Please try connecting again.`,
        });
      }
    } catch (error) {
      setConnectionStatuses((prev: Record<string, ToolkitConnectionStatus>) => ({
        ...prev,
        [toolkitSlug]: {
          ...prev[toolkitSlug],
          status: "not_connected",
        },
      }));

      addMessage({
        type: "system",
        content: `❌ Failed to complete OAuth connection for ${toolkitInfos[toolkitSlug]?.name || toolkitSlug}. Please try again.`,
      });
    }
  };

  const handleUpdateCredentials = (
    credentials: Partial<CredentialCollection["credentials"]>
  ) => {
    if (credentialCollection) {
      setCredentialCollection({
        ...credentialCollection,
        credentials: {
          ...credentialCollection.credentials,
          ...credentials,
        },
      });
    }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Left Side - Chat Interface */}
      <div className="w-1/2 flex flex-col border-r border-gray-800/50">
        <ChatHeader />

        {/* Chat Messages - Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                toolkitInfos={toolkitInfos}
                connectionStatuses={connectionStatuses}
                onConnectToolkit={connectToolkit}
              />
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-900/60 text-gray-100 border border-gray-700/50 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                  <span className="text-[15px] font-medium">
                    Generating your agent...
                  </span>
                </div>
              </div>
            )}

            {/* Auto scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Credential Collection UI */}
        {credentialCollection && (
          <CredentialForm
            credentialCollection={credentialCollection}
            toolkitInfos={toolkitInfos}
            onUpdateCredentials={handleUpdateCredentials}
            onSubmit={handleCredentialSubmit}
            onCancel={() => setCredentialCollection(null)}
          />
        )}

        {/* Input - Fixed at Bottom */}
        <ChatInput
          value={agentIdea}
          onChange={setAgentIdea}
          onSend={handleGenerateAgent}
          disabled={isGenerating}
          isGenerating={isGenerating}
        />
      </div>

      {/* Right Side - Preview */}
      <div className="w-1/2 flex flex-col bg-gray-950/50">
        <PreviewHeader onReload={reloadIframe} />

        {/* Preview Content - Fixed Height */}
        <div className="flex-1 p-6 bg-gradient-to-br from-gray-900/20 to-gray-800/20 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* HTML Preview - Direct iframe rendering */}
            <iframe
              ref={iframeRef}
              className="flex-1 w-full bg-white shadow-2xl rounded-lg border border-gray-700/50"
              src="/api/preview?type=default"
              title="Lovable AI Agent Preview"
              sandbox="allow-scripts allow-forms allow-same-origin"
            />

            {!generatedCode && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ready to build
                </h3>
                <p className="text-gray-400 text-sm">
                  Generate an agent to see the live preview above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
