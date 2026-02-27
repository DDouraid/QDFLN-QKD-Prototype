const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface BackendClient {
  id: string;
  grad_norm: number;
  malicious: boolean;
}

export interface BackendValidator {
  id: string;
  grad_norm: number;
  H_agg: string;
  malicious: boolean;
}

export interface BackendConsensus {
  H_star: string;
  winning_stake: number;
  total_stake: number;
  stake_pct: number;
  entries: Record<string, string>;
  fraudsters: string[];
  reputation: Record<string, number>;
  stake: Record<string, number>;
}

export interface RunRoundResponse {
  round_id: number;
  clients: BackendClient[];
  validators: BackendValidator[];
  consensus: BackendConsensus | Record<string, never>;
  logs: string[];
}

export async function runRound(): Promise<RunRoundResponse> {
  const res = await fetch(`${API_BASE}/api/run-round`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as RunRoundResponse;
}

