import { getBackendBaseURL } from "../config";

export interface ExecutionStep {
  step: number;
  node: string | null;
  checkpoint_id: string | null;
  created_at: string | null;
  next_nodes: string[];
  status: string;
}

export interface ExecutionHistoryResponse {
  thread_id: string;
  steps: ExecutionStep[];
}

export interface NodeExecutionDetail {
  node_name: string;
  checkpoint_id: string;
  created_at: string | null;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

export async function getExecutionHistory(threadId: string): Promise<ExecutionHistoryResponse> {
  const response = await fetch(`${getBackendBaseURL()}/api/execution/history/${encodeURIComponent(threadId)}`);
  if (!response.ok) {
    if (response.status === 404 || response.status === 422) {
      return { thread_id: threadId, steps: [] };
    }
    throw new Error(`Failed to fetch execution history: ${response.statusText}`);
  }
  return response.json();
}

export async function getExecutionDetail(
  threadId: string,
  checkpointId: string
): Promise<NodeExecutionDetail> {
  const response = await fetch(
    `${getBackendBaseURL()}/api/execution/detail/${encodeURIComponent(threadId)}/${encodeURIComponent(checkpointId)}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch execution detail: ${response.statusText}`);
  }
  return response.json();
}
