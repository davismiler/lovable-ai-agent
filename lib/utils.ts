/**
 * Utility functions
 */

import type { ToolkitConnectionStatus } from "@/types";

/**
 * Extracts toolkit name from a tool name
 */
export function extractToolkitName(toolName: string): string {
  if (toolName.startsWith("_")) {
    const parts = toolName.split("_");
    if (parts.length >= 3) {
      return (parts[0] + parts[1]).toLowerCase();
    }
  }
  const firstPart = toolName.split("_")[0];
  return firstPart.toLowerCase();
}

/**
 * Generates a unique user ID
 */
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats tool name for display
 */
export function formatToolName(tool: string): string {
  return tool
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
}

/**
 * Determines authentication type from toolkit status
 */
export function getAuthType(status: ToolkitConnectionStatus): string {
  if (status.isOAuth2) {
    return "OAuth2";
  }
  if (status.isApiKey) {
    return "API Key";
  }
  return status.authScheme || "unknown";
}

/**
 * Gets managed status text
 */
export function getManagedStatus(isComposioManaged: boolean): string {
  return isComposioManaged ? "🟢 Composio Managed" : "🟡 Custom Setup Required";
}

/**
 * Cleans and processes frontend HTML code
 */
export function processFrontendCode(
  frontend: string,
  userId: string
): string {
  let cleanFrontend = frontend
    .replace(/```html\s*/g, "")
    .replace(/```\s*$/g, "")
    .replace(/__LLM_API_KEY__/g, `""`)
    .replace(/__COMPOSIO_API_KEY__/g, `""`)
    .replace(/__USER_ID__/g, `"${userId}"`);

  // Ensure API_BASE_URL works from blob iframe by using document.referrer origin
  cleanFrontend = cleanFrontend.replace(
    /const\s+API_BASE_URL\s*=\s*window\.location\.origin\s*;/,
    'const API_BASE_URL = (document.referrer ? new URL(document.referrer).origin : "");'
  );

  return cleanFrontend;
}

/**
 * Creates shims for iframe isolation
 */
export function createIframeShims(): string {
  const originShim = `<script>(function(){try{var ref=document.referrer;var origin = ref ? new URL(ref).origin : (window.top && window.top.location ? window.top.location.origin : ''); if(origin){ try{var base=document.createElement('base'); base.href = origin + '/'; if(document.head){document.head.prepend(base);} }catch(_){} window.API_BASE_URL = origin; var of = window.fetch; if(of){ window.fetch = function(input, init){ try{ var u = typeof input==='string'? input : (input && input.url)||''; if(u && u.startsWith('/')){ return of(origin + u, init); } }catch(e){} return of(input, init); }; } } }catch(e){}})();</script>`;
  
  const storageShim = `<script>(function(){try{window.localStorage.getItem('__test');}catch(e){var m={};var s={getItem:(k)=>Object.prototype.hasOwnProperty.call(m,k)?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:(k)=>{delete m[k]},clear:()=>{m={}},key:(i)=>Object.keys(m)[i]||null,get length(){return Object.keys(m).length}};try{Object.defineProperty(window,'localStorage',{value:s,configurable:true});}catch(_){}try{Object.defineProperty(window,'sessionStorage',{value:{...s},configurable:true});}catch(_){} }})();</script>`;
  
  return originShim + storageShim;
}

/**
 * Injects shims into HTML
 */
export function injectShims(html: string, shims: string): string {
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match: string) => `${match}\n${shims}`);
  }
  return `${shims}\n${html}`;
}

