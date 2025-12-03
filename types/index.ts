/**
 * Type definitions for the Lovable AI Agents application
 */

export interface GeneratedCode {
  frontend: string;
  backend: string;
  discoveredTools: string[];
  useCase: string;
  systemPrompt: string;
  metadata?: {
    tools: string[];
    useCase: string;
    timestamp: string;
  };
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system" | "connection-status";
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface ToolkitConnectionStatus {
  connected: boolean;
  status: "connected" | "connecting" | "not_connected";
  authScheme?: string;
  isComposioManaged?: boolean;
  isOAuth2?: boolean;
  isApiKey?: boolean;
  managedSchemes?: string[];
  toolkitSlug?: string;
  connectionId?: string;
  apiKey?: string;
}

export interface CredentialCollection {
  isCollecting: boolean;
  toolkitSlug: string;
  authType: "oauth2" | "api_key";
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
}

export interface ToolkitInfo {
  name: string;
  composio_managed_auth_schemes?: string[];
  auth_config_details?: Array<{
    mode?: string;
  }>;
}

