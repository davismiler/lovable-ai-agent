/**
 * Application constants
 */

export const STORAGE_KEYS = {
  COMPOSIO_USER_ID: "composio_user_id",
} as const;

export const API_ENDPOINTS = {
  GENERATE_AGENT: "/api/generate-agent",
  EXECUTE_AGENT: "/api/execute-generated-agent",
  CREATE_CONNECTION: "/api/create-connection",
  WAIT_FOR_CONNECTION: "/api/wait-for-connection",
  TOOLKIT_INFO: "/api/toolkit-info",
  PREVIEW: "/api/preview",
} as const;

export const OAUTH_TIMEOUT = 300000; // 5 minutes in milliseconds

export const INITIAL_MESSAGE: Omit<import("@/types").ChatMessage, "id" | "timestamp"> = {
  type: "assistant",
  content:
    "Hi! I'm your AI agent builder. Describe the agent you'd like to create and I'll build both the frontend interface and backend logic for you.",
};

