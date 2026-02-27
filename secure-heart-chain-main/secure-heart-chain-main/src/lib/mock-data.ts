// Simulated DFLN data for the dashboard

export interface Client {
  id: string;
  name: string;
  status: "training" | "idle" | "uploading" | "error";
  datasetSize: number;
  gradientNorm: number;
  noiseLevel: number;
  lastUpdate: string;
  pqcStatus: "secured" | "handshake" | "pending";
}

export interface Validator {
  id: string;
  name: string;
  stake: number;
  reputation: number;
  status: "active" | "slashed" | "offline";
  gradientHash: string;
  anomaliesDetected: number;
  cosineSimilarity: number;
  suspicionCount: number;
}

export interface ConsensusRound {
  round: number;
  timestamp: string;
  status: "consensus" | "disputed" | "pending";
  participatingValidators: number;
  aggregationMethod: "median" | "trimmed_mean";
  blockHash: string;
  supermajority: boolean;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  source: string;
  message: string;
}

export const mockClients: Client[] = [
  { id: "c-001", name: "Client Alpha", status: "training", datasetSize: 12500, gradientNorm: 0.0342, noiseLevel: 0.01, lastUpdate: "2s ago", pqcStatus: "secured" },
  { id: "c-002", name: "Client Beta", status: "uploading", datasetSize: 8700, gradientNorm: 0.0289, noiseLevel: 0.015, lastUpdate: "5s ago", pqcStatus: "secured" },
  { id: "c-003", name: "Client Gamma", status: "idle", datasetSize: 15200, gradientNorm: 0.0401, noiseLevel: 0.01, lastUpdate: "12s ago", pqcStatus: "secured" },
  { id: "c-004", name: "Client Delta", status: "training", datasetSize: 9300, gradientNorm: 0.0178, noiseLevel: 0.02, lastUpdate: "1s ago", pqcStatus: "handshake" },
  { id: "c-005", name: "Client Epsilon", status: "error", datasetSize: 6100, gradientNorm: 0.8921, noiseLevel: 0.01, lastUpdate: "45s ago", pqcStatus: "pending" },
  { id: "c-006", name: "Client Zeta", status: "training", datasetSize: 11800, gradientNorm: 0.0315, noiseLevel: 0.012, lastUpdate: "3s ago", pqcStatus: "secured" },
];

export const mockValidators: Validator[] = [
  { id: "v-001", name: "Validator Node A", stake: 1000, reputation: 0.95, status: "active", gradientHash: "a3f8c1...e7b2d4", anomaliesDetected: 1, cosineSimilarity: 0.987, suspicionCount: 0 },
  { id: "v-002", name: "Validator Node B", stake: 850, reputation: 0.91, status: "active", gradientHash: "b7d2e9...f1a3c8", anomaliesDetected: 0, cosineSimilarity: 0.993, suspicionCount: 0 },
  { id: "v-003", name: "Validator Node C", stake: 200, reputation: 0.42, status: "slashed", gradientHash: "c1f4a7...d8e2b5", anomaliesDetected: 7, cosineSimilarity: 0.341, suspicionCount: 4 },
  { id: "v-004", name: "Validator Node D", stake: 920, reputation: 0.88, status: "active", gradientHash: "d5e8b3...a2c7f1", anomaliesDetected: 2, cosineSimilarity: 0.972, suspicionCount: 1 },
];

export const mockConsensusRounds: ConsensusRound[] = [
  { round: 47, timestamp: "14:32:01", status: "consensus", participatingValidators: 3, aggregationMethod: "trimmed_mean", blockHash: "0xf8a3...c7e1", supermajority: true },
  { round: 46, timestamp: "14:31:48", status: "consensus", participatingValidators: 4, aggregationMethod: "median", blockHash: "0xd2b7...a4f9", supermajority: true },
  { round: 45, timestamp: "14:31:33", status: "disputed", participatingValidators: 4, aggregationMethod: "trimmed_mean", blockHash: "0xe1c5...b8d3", supermajority: false },
  { round: 44, timestamp: "14:31:19", status: "consensus", participatingValidators: 3, aggregationMethod: "median", blockHash: "0xa9f2...e6c4", supermajority: true },
  { round: 43, timestamp: "14:31:04", status: "consensus", participatingValidators: 4, aggregationMethod: "trimmed_mean", blockHash: "0xb3d8...f1a7", supermajority: true },
];

export const mockLogs: LogEntry[] = [
  { timestamp: "14:32:01.342", level: "success", source: "Blockchain", message: "Round 47 consensus achieved — supermajority confirmed" },
  { timestamp: "14:32:01.198", level: "info", source: "Aggregator", message: "Trimmed mean aggregation complete. Gradient norm: 0.0312" },
  { timestamp: "14:32:00.876", level: "info", source: "Validator-A", message: "SPHINCS+ signature verified for Client Alpha" },
  { timestamp: "14:32:00.654", level: "warn", source: "Validator-C", message: "Anomaly detected: Client Epsilon gradient norm 0.89 exceeds threshold" },
  { timestamp: "14:32:00.421", level: "info", source: "PQC", message: "ML-KEM-512 key encapsulation complete for Client Delta" },
  { timestamp: "14:31:59.987", level: "error", source: "Validator-C", message: "Stake slashed: repeated anomaly submissions (suspicion count: 4)" },
  { timestamp: "14:31:59.743", level: "info", source: "Client-Alpha", message: "Local training epoch 15 complete. Loss: 0.0234" },
  { timestamp: "14:31:59.512", level: "success", source: "PQC", message: "All PQC handshakes verified — network secured" },
  { timestamp: "14:31:59.201", level: "info", source: "Aggregator", message: "Received 5/6 encrypted gradient packets" },
  { timestamp: "14:31:58.876", level: "warn", source: "Network", message: "Client Epsilon connection timeout — retrying" },
];

export const mockMetrics = {
  totalRounds: 47,
  activeClients: 5,
  activeValidators: 3,
  consensusRate: 93.6,
  avgGradientNorm: 0.0305,
  pqcKeysExchanged: 284,
  blocksFinalized: 44,
  slashEvents: 2,
};
