/**
 * Credential collection form component
 */

import type { CredentialCollection } from "@/types";

interface ToolkitInfo {
  name?: string;
}

interface CredentialFormProps {
  credentialCollection: CredentialCollection;
  toolkitInfos: Record<string, unknown>;
  onUpdateCredentials: (
    credentials: Partial<CredentialCollection["credentials"]>
  ) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CredentialForm({
  credentialCollection,
  toolkitInfos,
  onUpdateCredentials,
  onSubmit,
  onCancel,
}: CredentialFormProps) {
  const toolkit = toolkitInfos[credentialCollection.toolkitSlug] as ToolkitInfo | undefined;

  const isOAuth2 = credentialCollection.authType === "oauth2";
  const isValid =
    isOAuth2
      ? credentialCollection.credentials.clientId &&
        credentialCollection.credentials.clientSecret
      : credentialCollection.credentials.apiKey;

  return (
    <div className="flex-shrink-0 p-6 border-t border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/30">
        <h3 className="text-white font-semibold mb-4">
          Connect {toolkit?.name || credentialCollection.toolkitSlug}
        </h3>

        {isOAuth2 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={credentialCollection.credentials.clientId || ""}
                onChange={(e) =>
                  onUpdateCredentials({ clientId: e.target.value })
                }
                placeholder="Enter your client ID"
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={credentialCollection.credentials.clientSecret || ""}
                onChange={(e) =>
                  onUpdateCredentials({ clientSecret: e.target.value })
                }
                placeholder="Enter your client secret"
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={credentialCollection.credentials.apiKey || ""}
              onChange={(e) => onUpdateCredentials({ apiKey: e.target.value })}
              placeholder="Enter your API key"
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Connect
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

