/**
 * Toolkit-related utility functions
 */

import type { ToolkitConnectionStatus, ToolkitInfo } from "@/types";

export function analyzeToolkitAuth(toolkit: ToolkitInfo): {
  isComposioManaged: boolean;
  isOAuth2: boolean;
  isApiKey: boolean;
  authScheme?: string;
} {
  const managedSchemes = toolkit.composio_managed_auth_schemes || [];
  const isComposioManaged = managedSchemes.length > 0;
  const authScheme = toolkit.auth_config_details?.[0]?.mode;
  const managedSchemesLower = managedSchemes.map((s: string) =>
    s.toLowerCase()
  );
  
  const isOAuth2 =
    managedSchemesLower.includes("oauth2") ||
    managedSchemesLower.includes("oauth") ||
    authScheme?.toLowerCase() === "oauth2";
    
  const isApiKey =
    managedSchemesLower.includes("api_key") ||
    managedSchemesLower.includes("bearer_token") ||
    managedSchemesLower.includes("apikey") ||
    authScheme?.toLowerCase() === "api_key";

  return {
    isComposioManaged,
    isOAuth2,
    isApiKey,
    authScheme,
  };
}

export function createConnectionStatus(
  toolkit: ToolkitInfo,
  toolkitSlug: string
): ToolkitConnectionStatus {
  const auth = analyzeToolkitAuth(toolkit);
  
  return {
    connected: false,
    status: "not_connected",
    authScheme: auth.authScheme,
    isComposioManaged: auth.isComposioManaged,
    isOAuth2: auth.isOAuth2,
    isApiKey: auth.isApiKey,
    managedSchemes: toolkit.composio_managed_auth_schemes,
    toolkitSlug: toolkitSlug,
  };
}

