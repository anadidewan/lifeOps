import { apiJson } from "./http";
import type { SyncProvider, SyncResultResponse } from "./types";

export async function triggerIntegrationSync(provider: SyncProvider): Promise<SyncResultResponse> {
  return apiJson<SyncResultResponse>(`/integrations/${provider}/sync`, {
    method: "POST",
  });
}
